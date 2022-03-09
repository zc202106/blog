const { encrypt, decrypt } = require('./core/util/util')
const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
let db = mongoose.connection
db.on('error', function (err) {
  console.log(err)
})
db.on('open', function (err) {
  console.dir('mongodb://127.0.0.1:27017/blog is open')
})

const schema = new mongoose.Schema({
  name: {
    type: String,
    //不指定select查询不会返回
    required: [true, '密码必填'],
    validate: {
      validator (val) {
        return true
      },
      message: "密码必须为 数字+密码(大小写) 8-12位"
    },
    set (val, schematype) {
      try {
        val = decrypt(val)
      } catch (err) {
        val = val
      }
      let isValidate = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!.#*?&]{8,12}$/.test(val)
      if (isValidate) {
        return encrypt(val)
      }
      return '密码格式不正确'
    }
  }
})
let md = mongoose.model('cls', schema)


md.findByIdAndUpdate("5fe75dd1d91f8d33d42459bf", { name: '321312' }).then(doc => {
  console.log(doc)
}).catch(err => {
  console.log(err)
})
md.findById("5fe75dd1d91f8d33d42459bf").select('+name').then(doc => {
  console.log(doc)
}).catch(err => {
  console.log(err)
})



// md.create({ name: '123' }).then(doc => {
//   console.log(doc)
// }).catch(err => {
//   console.log(err)
// })