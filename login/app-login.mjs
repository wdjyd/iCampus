import {
    postRequestWithCookies,
    getRequestWithoutCookies,
    extractCookiesFromResponse
} from '../utils/helpers.mjs';


/**
 * 执行预登录操作，并返回验证码图片URL和初始Cookie
 * 
 * @returns {Promise<string>} 包含验证码图片URL和Cookie的JSON字符串
 */
export async function captcha() {
    // 不需要验证码
    const result = {
        "code": -1,
        "data": ""
    };
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}

/**
 * 使用用户名、密码登录APP系统，并返回登录结果
 * 
 * @param {string} userName - 用户名
 * @param {string} password - 密码
 * @returns {Promise<string>} 包含登录状态和Cookie的JSON字符串
 */
export async function login(userName, password) {
    const preLoginUrl = "https://app.ucas.ac.cn/uc/wap/login?redirect=https%3A%2F%2Fapp.ucas.ac.cn%2Fappsquare%2Fwap%2Fdefault%2Findex%3Fsid%3D1";
    const preLoginResponse = await getRequestWithoutCookies(preLoginUrl);
    appCookies = extractCookiesFromResponse(preLoginResponse);

    const loginUrl = "https://app.ucas.ac.cn/uc/wap/login/check";
    const payload = new URLSearchParams();
    payload.append('username', userName);
    payload.append('password', password);

    const loginResponse = await postRequestWithCookies(loginUrl, appCookies, payload);
    const loginCookies = extractCookiesFromResponse(loginResponse);
    appCookies = `${appCookies}; ${loginCookies}`;

    // 先登录sep，如果sep登陆成功这个也一定成功
    const result = {
        'code': 1,
        'data': appCookies
    };
    
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}
