use std::path::Path;

#[tauri::command]
pub fn is_deb_package() -> bool {
    let app_path = match std::env::current_exe() {
        Ok(path) => path,
        Err(_) => return false,
    };

    let in_system_path = app_path
        .to_str()
        .map(|p| p.starts_with("/usr"))
        .unwrap_or(false);

    if !in_system_path {
        return false;
    }

    let dpkg_exists = Path::new("/var/lib/dpkg").exists();
    let apt_exists = Path::new("/etc/apt").exists();

    let package_in_dpkg = if let Ok(output) = std::process::Command::new("dpkg")
        .args(["-S", &app_path.to_string_lossy()])
        .output()
    {
        output.status.success()
    } else {
        false
    };

    dpkg_exists && apt_exists && package_in_dpkg
}
