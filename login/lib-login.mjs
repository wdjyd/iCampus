import {
    header,
    getRequestWithCookies,
    extractCookiesFromResponse
} from '../utils/helpers.mjs';

import axios from 'axios';

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
 * 访问图书馆网站，并返回访问结果
 * 
 * @returns {Promise<string>} 包含登录状态和LIB Cookie的JSON字符串
 */
export async function login() {
    const libUrl = "https://lib.ucas.ac.cn/"

    // 定义状态码，1表示登录成功，-1表示登录失败
    var statusCode;
    var libCookies;
    try {
        const response = await axios.get(libUrl,  {
            headers: header, maxRedirects: 0
        });
        statusCode = -1;
      } catch (error) {
        if (error.response && error.response.status >= 300 && error.response.status < 400) {
            libCookies = extractCookiesFromResponse(error.response);
            statusCode = 1;
        } else {
            statusCode = -1;
        }
      }

    const libWirelessUrl = "https://lib.ucas.ac.cn/?noWireless";
    await getRequestWithCookies(libWirelessUrl, libCookies);
    const additionalCookies = "Hm_lvt_d4448745a003beb039949b0c85dbd54a=1721096675; Hm_lpvt_d4448745a003beb039949b0c85dbd54a=1721101932";
    
    // 构造返回的数据对象，包含状态码和LIB Cookies
    const result = {
        "code": statusCode,
        "data": `${libCookies}; ${additionalCookies}`
    };
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}
