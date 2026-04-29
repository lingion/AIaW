package app.aiaw;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.util.Log;
import android.webkit.MimeTypeMap;

import androidx.activity.result.ActivityResult;
import androidx.documentfile.provider.DocumentFile;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "LocalFs")
public class LocalFsPlugin extends Plugin {
    private static final String TAG = "LocalFsPlugin";

    private DocumentFile asDocument(Uri uri) {
        DocumentFile file = DocumentFile.fromSingleUri(getActivity(), uri);
        if (file == null) file = DocumentFile.fromTreeUri(getActivity(), uri);
        return file;
    }

    private String guessMimeType(String name) {
        String ext = MimeTypeMap.getFileExtensionFromUrl(name);
        String mime = ext != null ? MimeTypeMap.getSingleton().getMimeTypeFromExtension(ext.toLowerCase()) : null;
        return mime != null ? mime : "text/plain";
    }

    private void copyStream(Uri sourceUri, Uri targetUri) throws Exception {
        InputStream is = getActivity().getContentResolver().openInputStream(sourceUri);
        OutputStream os = getActivity().getContentResolver().openOutputStream(targetUri, "wt");
        if (is == null || os == null) throw new Exception("Cannot open copy streams");
        byte[] buffer = new byte[8192];
        int len;
        while ((len = is.read(buffer)) != -1) {
            os.write(buffer, 0, len);
        }
        os.flush();
        is.close();
        os.close();
    }

    @PluginMethod
    public void health(PluginCall call) {
        JSObject result = new JSObject();
        result.put("ok", true);
        result.put("plugin", "LocalFs");
        call.resolve(result);
    }

    @PluginMethod
    public void pickDirectory(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION |
                Intent.FLAG_GRANT_WRITE_URI_PERMISSION |
                Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION |
                Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(call, intent, "pickDirectoryResult");
    }

    @ActivityCallback
    private void pickDirectoryResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        try {
            if (result == null || result.getData() == null || result.getData().getData() == null) {
                call.reject("No directory selected");
                return;
            }
            Activity activity = getActivity();
            Intent data = result.getData();
            Uri uri = data.getData();
            final int takeFlags = data.getFlags() &
                    (Intent.FLAG_GRANT_READ_URI_PERMISSION |
                     Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            activity.getContentResolver().takePersistableUriPermission(uri, takeFlags);
            DocumentFile dir = DocumentFile.fromTreeUri(activity, uri);
            JSObject res = new JSObject();
            res.put("uri", uri.toString());
            res.put("name", dir != null ? dir.getName() : "");
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "pickDirectoryResult failed", e);
            call.reject("pickDirectory failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void listChildren(PluginCall call) {
        try {
            String uriStr = call.getString("uri");
            if (uriStr == null || uriStr.isEmpty()) {
                call.reject("uri is required");
                return;
            }
            Uri uri = Uri.parse(uriStr);
            DocumentFile dir = DocumentFile.fromTreeUri(getActivity(), uri);
            if (dir == null || !dir.exists() || !dir.isDirectory()) {
                call.reject("Directory not accessible");
                return;
            }
            JSArray files = new JSArray();
            for (DocumentFile child : dir.listFiles()) {
                JSObject item = new JSObject();
                item.put("name", child.getName());
                item.put("uri", child.getUri().toString());
                item.put("isDirectory", child.isDirectory());
                item.put("isFile", child.isFile());
                item.put("canRead", child.canRead());
                item.put("canWrite", child.canWrite());
                item.put("lastModified", child.lastModified());
                item.put("length", child.length());
                files.put(item);
            }
            JSObject res = new JSObject();
            res.put("items", files);
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "listChildren failed", e);
            call.reject("listChildren failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void readText(PluginCall call) {
        try {
            String uriStr = call.getString("uri");
            int offset = call.getInt("offset", 0);
            int maxChars = call.getInt("maxChars", 50000);
            if (uriStr == null || uriStr.isEmpty()) {
                call.reject("uri is required");
                return;
            }
            if (offset < 0) offset = 0;
            if (maxChars <= 0) maxChars = 50000;

            Uri uri = Uri.parse(uriStr);
            InputStream is = getActivity().getContentResolver().openInputStream(uri);
            if (is == null) {
                call.reject("Cannot open file");
                return;
            }
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line).append("\n");
            reader.close();

            String full = sb.toString();
            int totalChars = full.length();
            int start = Math.min(offset, totalChars);
            int end = Math.min(start + maxChars, totalChars);
            String sliced = full.substring(start, end);

            JSObject res = new JSObject();
            res.put("content", sliced);
            res.put("offset", start);
            res.put("returnedChars", sliced.length());
            res.put("totalChars", totalChars);
            res.put("hasMore", end < totalChars);
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "readText failed", e);
            call.reject("readText failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void writeText(PluginCall call) {
        try {
            String uriStr = call.getString("uri");
            String content = call.getString("content", "");
            boolean append = call.getBoolean("append", false);
            if (uriStr == null || uriStr.isEmpty()) {
                call.reject("uri is required");
                return;
            }
            Uri uri = Uri.parse(uriStr);
            String mode = append ? "wa" : "wt";
            OutputStream os = getActivity().getContentResolver().openOutputStream(uri, mode);
            if (os == null) {
                call.reject("Cannot open output stream");
                return;
            }
            os.write(content.getBytes(StandardCharsets.UTF_8));
            os.flush();
            os.close();
            JSObject res = new JSObject();
            res.put("ok", true);
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "writeText failed", e);
            call.reject("writeText failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void createDirectory(PluginCall call) {
        try {
            String parentUriStr = call.getString("parentUri");
            String name = call.getString("name");
            if (parentUriStr == null || name == null || name.isEmpty()) {
                call.reject("parentUri and name are required");
                return;
            }
            DocumentFile parent = DocumentFile.fromTreeUri(getActivity(), Uri.parse(parentUriStr));
            if (parent == null || !parent.exists() || !parent.isDirectory()) {
                call.reject("Parent directory not accessible");
                return;
            }
            DocumentFile dir = parent.createDirectory(name);
            if (dir == null) {
                call.reject("Failed to create directory");
                return;
            }
            JSObject res = new JSObject();
            res.put("uri", dir.getUri().toString());
            res.put("name", dir.getName());
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "createDirectory failed", e);
            call.reject("createDirectory failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void createTextFile(PluginCall call) {
        try {
            String parentUriStr = call.getString("parentUri");
            String name = call.getString("name");
            String content = call.getString("content", "");
            if (parentUriStr == null || name == null || name.isEmpty()) {
                call.reject("parentUri and name are required");
                return;
            }
            DocumentFile parent = DocumentFile.fromTreeUri(getActivity(), Uri.parse(parentUriStr));
            if (parent == null || !parent.exists() || !parent.isDirectory()) {
                call.reject("Parent directory not accessible");
                return;
            }
            DocumentFile file = parent.createFile(guessMimeType(name), name);
            if (file == null) {
                call.reject("Failed to create file");
                return;
            }
            OutputStream os = getActivity().getContentResolver().openOutputStream(file.getUri(), "wt");
            if (os == null) {
                call.reject("Cannot open created file");
                return;
            }
            os.write(content.getBytes(StandardCharsets.UTF_8));
            os.flush();
            os.close();
            JSObject res = new JSObject();
            res.put("uri", file.getUri().toString());
            res.put("name", file.getName());
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "createTextFile failed", e);
            call.reject("createTextFile failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void deleteDocument(PluginCall call) {
        try {
            String uriStr = call.getString("uri");
            if (uriStr == null || uriStr.isEmpty()) {
                call.reject("uri is required");
                return;
            }
            DocumentFile file = asDocument(Uri.parse(uriStr));
            if (file == null || !file.exists()) {
                call.reject("Document not accessible");
                return;
            }
            boolean ok = file.delete();
            if (!ok) {
                call.reject("Delete failed");
                return;
            }
            JSObject res = new JSObject();
            res.put("ok", true);
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "deleteDocument failed", e);
            call.reject("deleteDocument failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void renameDocument(PluginCall call) {
        try {
            String uriStr = call.getString("uri");
            String newName = call.getString("newName");
            if (uriStr == null || newName == null || newName.isEmpty()) {
                call.reject("uri and newName are required");
                return;
            }
            Uri uri = Uri.parse(uriStr);
            Uri renamed = null;
            try {
                renamed = DocumentsContract.renameDocument(getActivity().getContentResolver(), uri, newName);
            } catch (Exception ignored) {}

            if (renamed != null) {
                DocumentFile renamedFile = asDocument(renamed);
                JSObject res = new JSObject();
                res.put("uri", renamed.toString());
                res.put("name", renamedFile != null ? renamedFile.getName() : newName);
                call.resolve(res);
                return;
            }

            // Fallback: for providers that don't support renameDocument properly,
            // use DocumentFile.renameTo on the same document.
            DocumentFile file = asDocument(uri);
            if (file == null || !file.exists()) {
                call.reject("Document not accessible");
                return;
            }
            boolean ok = file.renameTo(newName);
            if (!ok) {
                call.reject("Rename failed");
                return;
            }
            JSObject res = new JSObject();
            res.put("uri", file.getUri().toString());
            res.put("name", file.getName());
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "renameDocument failed", e);
            call.reject("renameDocument failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void copyDocument(PluginCall call) {
        try {
            String sourceUriStr = call.getString("sourceUri");
            String targetDirUriStr = call.getString("targetDirUri");
            String newName = call.getString("newName");
            if (sourceUriStr == null || targetDirUriStr == null) {
                call.reject("sourceUri and targetDirUri are required");
                return;
            }
            DocumentFile src = asDocument(Uri.parse(sourceUriStr));
            DocumentFile dstDir = DocumentFile.fromTreeUri(getActivity(), Uri.parse(targetDirUriStr));
            if (src == null || !src.exists() || dstDir == null || !dstDir.exists() || !dstDir.isDirectory()) {
                call.reject("Source or target directory not accessible");
                return;
            }
            String fileName = (newName != null && !newName.isEmpty()) ? newName : (src.getName() != null ? src.getName() : "copied.txt");
            DocumentFile dst = dstDir.createFile(guessMimeType(fileName), fileName);
            if (dst == null) {
                call.reject("Failed to create destination file");
                return;
            }
            copyStream(src.getUri(), dst.getUri());
            JSObject res = new JSObject();
            res.put("uri", dst.getUri().toString());
            res.put("name", dst.getName());
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "copyDocument failed", e);
            call.reject("copyDocument failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void moveDocument(PluginCall call) {
        try {
            String sourceUriStr = call.getString("sourceUri");
            String targetDirUriStr = call.getString("targetDirUri");
            String newName = call.getString("newName");
            if (sourceUriStr == null || targetDirUriStr == null) {
                call.reject("sourceUri and targetDirUri are required");
                return;
            }
            String fileName = newName;
            if (fileName == null || fileName.isEmpty()) {
                DocumentFile src0 = asDocument(Uri.parse(sourceUriStr));
                fileName = src0 != null && src0.getName() != null ? src0.getName() : "moved.txt";
            }
            DocumentFile src = asDocument(Uri.parse(sourceUriStr));
            DocumentFile dstDir = DocumentFile.fromTreeUri(getActivity(), Uri.parse(targetDirUriStr));
            if (src == null || !src.exists() || dstDir == null || !dstDir.exists() || !dstDir.isDirectory()) {
                call.reject("Source or target directory not accessible");
                return;
            }
            DocumentFile dst = dstDir.createFile(guessMimeType(fileName), fileName);
            if (dst == null) {
                call.reject("Failed to create destination file");
                return;
            }
            copyStream(src.getUri(), dst.getUri());
            boolean deleted = src.delete();
            if (!deleted) {
                call.reject("Move copied but failed to delete source");
                return;
            }
            JSObject res = new JSObject();
            res.put("uri", dst.getUri().toString());
            res.put("name", dst.getName());
            call.resolve(res);
        } catch (Exception e) {
            Log.e(TAG, "moveDocument failed", e);
            call.reject("moveDocument failed: " + e.getMessage());
        }
    }
}
