
const simpleString = function (str, len) {
  const text = (str || '').replace(/\r?\n/g, "\\n").substr(0, len)
  return text
}

export default async function (push) {
  try {
    const datetime = new Date().toLocaleString()
    const device = push.source_device_iden
    const type = push.type
    const packageName = push.package_name
    const title = push.title
    const text = simpleString(push.body, 80)

    console.log(`${datetime} [${device}][${type}][${packageName}] ${title}: ${text}`)
  } catch (err) {
    console.error(err)
  }
}
