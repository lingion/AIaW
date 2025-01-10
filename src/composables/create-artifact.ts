import { db } from 'src/utils/db'
import { genId } from 'src/utils/functions'
import { Artifact, Workspace } from 'src/utils/types'
import { Ref } from 'vue'
import { useRouter } from 'vue-router'

export function useCreateArtifact(workspace: Ref<Workspace>) {
  const router = useRouter()
  async function createArtifact(props: Partial<Artifact> = {}, mode?: 'edit' | 'view') {
    const id = genId()
    await db.canvases.add({
      id,
      name: 'new_artifact',
      versions: [{ date: new Date(), text: '' }],
      currIndex: 0,
      readable: true,
      writable: true,
      open: true,
      workspaceId: workspace.value.id,
      tmp: '',
      ...props
    })
    router.push({ query: { artifactId: id, mode } })
  }
  return { createArtifact }
}
