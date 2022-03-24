const itemStatus = {
    'NoBind': {
        id: 0,
        status_name: '未提交审核',
        next: [1]
    },
    'FirstAudit': {
        id: 1,
        status_name: '一级审核员审核中',
        next: [2, 4, 5]
    },
    'SecondAudit': {
        id: 2,
        status_name: '二级审核员审核中',
        next: [3, 4, 5]
    },
    'Success': {
        id: 3,
        status_name: '审核通过',
        next: [5]
    },
    'Failure': {
        id: 4,
        status_name: '审核不通过',
        next: [0]
    },
    'Recall': {
        id: 5,
        status_name: '撤回待审核',
        next: [0]
    },

}

module.exports = itemStatus