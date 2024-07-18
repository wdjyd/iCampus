import { 
    header, 
    rsaEncrypt, 
    postRequestWithCookies, 
    getRequestWithoutCookies, 
    getRequestWithCookies, 
    extractCookiesFromResponse 
} from '../utils/helpers.mjs';

import axios from 'axios';

/**
 * 执行SEP系统的预登录操作，并返回验证码图片URL和初始Cookie
 * 
 * @returns {Promise<string>} 包含验证码图片URL和Cookie的JSON字符串
 */
export async function captcha() {
    // 预登录SEP系统
    const preLoginUrl = "https://sep.ucas.ac.cn";    
    const preLoginResponse = await getRequestWithoutCookies(preLoginUrl);
    var sepCookies = extractCookiesFromResponse(preLoginResponse);
    
    // 构造返回的数据对象，包含验证码图片的URL和初始Cookie
    const result = {
        "code": 1,
        "data": {
            "url": "https://sep.ucas.ac.cn/changePic",
            "cookie": sepCookies
        }
    };
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}

/**
 * 使用用户名、密码和验证码登录jwxt系统，并返回登录结果
 * 
 * @param {string} userName - 用户名
 * @param {string} password - 密码
 * @param {string} vertificationCode - 验证码
 * @param {string} sepCookie - 初始的SEP Cookie
 * @returns {Promise<string>} 包含登录状态和Cookie的JSON字符串
 */
export async function login(userName, password, vertificationCode, sepCookie) {
    var status = loginSep(userName, password, vertificationCode, sepCookie);
    // 如果登录失败，直接返回code为负值
    if (status < 0) {
        const result = {
            "code": status,
            "data": ""
        };
        return JSON.stringify(result, null, 4);
    }
    return JSON.stringify(loginJwxt(sepCookie), null, 4);
}

/**
 * 使用用户名、密码和验证码登录SEP系统，并返回登录结果
 * 
 * @param {string} userName - 用户名
 * @param {string} password - 密码
 * @param {string} vertificationCode - 验证码
 * @param {string} sepCookie - 初始的SEP Cookie
 * @returns {Promise<string>} 包含登录状态和Cookie的JSON字符串
 */
async function loginSep(userName, password, vertificationCode, sepCookie) {
    // SEP系统登录URL
    const loginUrl = "https://sep.ucas.ac.cn/slogin";
    // 使用RSA加密密码
    const encryptedPassword = rsaEncrypt(password);
    console.log(encryptedPassword);
    // 创建请求负载
    const payload = new URLSearchParams();
    payload.append('userName', userName);
    payload.append('pwd', encryptedPassword);
    payload.append('sb', 'sb');
    payload.append('loginFrom', '');

    // 判断是否需要验证码，如果需要，则添加验证码到请求负载中
    if (vertificationCode.length != 0) {
        payload.append('certCode', vertificationCode);
    }

    const loginResponse = await postRequestWithCookies(loginUrl, sepCookie, payload);

    // 定义状态码，1表示登录成功，-1表示登录失败
    var statusCode;
    if (loginResponse.data.includes("网上缴费大厅")) {
        statusCode = 1; // 登录成功
    } else {
        statusCode = -1; // 登录失败
    }
    return statusCode;
}

/**
 * 根据SEP系统cookies登录教务系统网站，并返回登录结果
 * 
 * @param {string} sepCookie - 初始的SEP Cookie
 * @returns {Promise<string>} 包含登录状态和Jwxt Cookie的JSON字符串
 */
export async function loginJwxt(sepCookies) {
    const portalUrl = "https://sep.ucas.ac.cn/portal/site/226/821"
    const portalResponse = await getRequestWithCookies(portalUrl, sepCookies);

    const pattern = /href="https:\/\/xkcts.ucas.ac.cn:8443\/login\?Identity=([a-zA-Z0-9\-]+)&roleId=([0-9]+)"/;
    const match = portalResponse.data.match(pattern);
    
    const identity = match[1];
    const roleId = match[2];
    const identityUrl = `https://xkcts.ucas.ac.cn:8443/login?Identity=${identity}&roleId=${roleId}`;

    // 定义状态码，1表示登录成功，-1表示登录失败
    var statusCode;
    var jwxtCookies;

    // 获取教务系统网页的cookies
    try {
        const response = await axios.get(identityUrl,  {
            headers: { ...header, 'Cookie': sepCookies }, 
            maxRedirects: 0
        });
        statusCode = -1;                // 跳转失败
    } catch (error) {
        if (error.response && error.response.status >= 300 && error.response.status < 400) {
            jwxtCookies = extractCookiesFromResponse(error.response);
            statusCode = 1;             // jwxt访问成功
        } else {
            statusCode = -1;            // 跳转失败
        }
    }

    // 构造返回的数据对象，包含状态码和JWXT Cookies
    return {
        "code": statusCode,
        "data": jwxtCookies
    }
}
