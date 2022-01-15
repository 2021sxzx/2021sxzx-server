  /**
   * 保存用户的评论（不知道是否需要使用）
   * @param commentData 用户的评价数据
   * @returns {Promise<Document<any, any, unknown> & Require_id<unknown>>}
   */
   async function saveUserComment(commentData) {
    try {
      let data = await saveComment(commentData);
      return new SuccessModel({msg: '评论添加成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }

    /**
   * 获取日志总数
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
     async function getParam() {
      try {
        let data = await getCommentParam();
        return new SuccessModel({msg: '获取日志参数成功', data:data});
      } catch (e) {
        return new ErrorModel({msg:e.message})
      }
    }
    
  /**
   * 获取系统日志
   * @param SystemLogData 其中包括pageNum页数
   * @returns {Promise<ErrorModel|SuccessModel>}
   */
   async function getSystemLog(systemLogData) {
    try {
      let {pageNum} = systemLogData
      if(!pageNum) {
        pageNum = 0
      }
      let data = await getSystemLogDetail({pageNum })
      return new SuccessModel({msg: '获取系统日志成功', data:data});
    } catch (e) {
      return new ErrorModel({msg:e.message})
    }
  }
    