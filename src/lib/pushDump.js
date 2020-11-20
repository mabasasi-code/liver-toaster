const simpleString = function (str, len) {
  const text = (str || '').replace(/\r?\n/g, "\\n").substr(0, len)
  return text
}

const handle = function (push) {
  const datetime = new Date().toLocaleString()
  const text = simpleString(push.body, 80)
  console.log(`${datetime} [${push.source_device_iden}][${push.type}][${push.package_name}] ${push.title}: ${text}`)
}

export default handle
