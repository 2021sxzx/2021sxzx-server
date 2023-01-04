/**
 * 检查字符串中是否有非法内容，防止 XSS 攻击
 * @param str{string} 待检查的字符串
 * @return {{isLegal: boolean, legalStr: string}}
 * isLegal：字符串是否合法。legalStr：过滤了非法字符后的合法字符串。
 */
function validateString(str) {
    // 如果匹配到了指定符号就是非法字符串
    const res ={
        isLegal: !(/[|&;$%@'"\\<>()+,\n\r]/.test(str)),
        legalStr: str,
    }

    //对非法字符进行过滤处理
    if (!res.isLegal) {
        res.legalStr.replace(/[|&;$%@'"\\<>()+,\n\r]/g, '')
    }

    return res
}

module.exports = {
    validateString
}
