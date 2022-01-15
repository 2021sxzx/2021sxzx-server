/**
 * 系统日志接口（系统日志是自动生成？不需要这个）
 */
 router.post('/v1/systemLog',async (req,res,next) => {
  let systemLogData = req.body;
  commentData.create_time = Date.now()
  let data = await saveUserComment(commentData);
  setStatusCode(res,data)
  res.json(data)
})


router.get('/v1/systemLog',async (req,res,next) => {
  let systemLogData = req.query
  let data = await getSystemLog(systemLogData)
  setStatusCode(res,data)
  res.json(data)
})

router.get('/v1/allSystemLog', async (req,res,next) => {
  let data = await getSystemLog2()
  setStatusCode(res,data)
  res.json(data)
})

/**
 * 用户评价的参数获取
 */
 router.get('/v1/commentParam',async (req,res,next) => {
  let data = await getParam()
  setStatusCode(res,data)
  res.json(data)
})