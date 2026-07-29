// Vite scans the work folders and hands us every image URL.
// Delete a file from src/assets/work/<slug>/ and it disappears here too.
const modules = import.meta.glob('../assets/work/*/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const GALLERIES = {}
for (const path of Object.keys(modules).sort()) {
  const slug = path.split('/').at(-2)
  ;(GALLERIES[slug] ??= []).push(modules[path])
}
