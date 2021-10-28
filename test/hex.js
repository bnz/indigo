const fs = require('fs')

fs.readFile('./src/assets/hex.svg', 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    return
  }

  const arr = [...data.match(/(id=\")([a-z0-9_-]+)(\")/igm)]
    .filter((item) =>
      !item.match(/^id=\"bg/igm)
      && !item.match(/^id=\"circle/igm)
      && !item.match(/^id=\"line/igm)
      && !item.match(/^id=\"arc/igm))
    .map((item) => item.replace(/\"/g, '').replace('id=', ''))

  console.log(arr.length)
  arr.forEach((item) => {
    // console.log(item)
  })

  const content = `const ids = [\n"${arr.join('",\n"')}"\n]`

  fs.writeFile('test/script.js', content, err => {
    if (err) {
      console.error(err)
      return
    }
  })
})
