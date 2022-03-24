const express = require('express');
const router = express.Router();
const Article = require('../models/Article')
const jwt = require('jsonwebtoken') //token生成包  JWT
const { getPublicKeySync } = require('../core/rsaControl')

/*post 文章点赞 */
router.post('/:id', async (req, res, next) => {
  let token = req.headers?.authorization?.replace('Bearer ', '')
  if (token) {
    let key = getPublicKeySync()
    jwt.verify(token, key, function (err, data) {
      if (err) {
        console.log(err)
        return
      }
      let userId = data._id
      if (userId) {
        req._id = userId
      }
    })
  }
  next()
}, async (req, res, next) => {
  let id = req.params.id
  // let isLike = req.body.isLike //true 点赞 false 取消点赞
  let isLike = false
  let query = {}
  /*
    如果登录用户提交
    判断文章like_users中是否存在 
    如果已存在 就$pull 删除 isLike=false  取消点赞
    如果不存在 就$addToSet 添加 isLike=true
  */
  try {
    if (req._id) {
      let article = await Article.findById(id)
      let likeUsers = article['like_users']

      isLike = !(likeUsers.includes(req._id))

      query[isLike ? '$addToSet' : '$pull'] = {
        like_users: req._id
      }
    }
    query['$inc'] = {
      like_num: isLike ? 1 : -1
    }
    let result = await Article.findByIdAndUpdate(id, query)
    let likes = query['$inc']['like_num'] === 1 ? (++result.like_num) : (--result.like_num)
    // console.log(likes);
    res.send(200, {
      message: '点赞成功',
      data: {
        likes
      }
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;