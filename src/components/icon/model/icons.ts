const svgResources = new Map<string, string>()
const imageResources = new Map<string, string>()

function loadIcons() {
  let modules = import.meta.glob('@/assets/icons/**/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  })

  for (const fileName in modules) {
    const name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.length - 4)
    svgResources.set(name, String(modules[fileName]))
  }

  modules = import.meta.glob('@/assets/images/**/*.png', {
    query: '?url',
    import: 'default',
    eager: true,
  })
  for (const fileName in modules) {
    const name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.length - 4)
    imageResources.set(name, String(modules[fileName]))
  }
}

function getSvgIcon(name: string) {
  return svgResources.get(name)
}

function getImageUrl(name: string) {
  return imageResources.get(name)
}

export { getImageUrl, getSvgIcon, loadIcons, svgResources }
