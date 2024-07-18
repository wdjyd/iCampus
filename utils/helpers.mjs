import NodeRSA  from 'node-rsa';
import axios from 'axios';

// 定义HTTP请求头
export const header = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
};

/**
 * 使用RSA公钥加密消息
 * 
 * @param {string} message - 要加密的消息
 * @returns {string} 加密后的消息（Base64编码）
 */
export function rsaEncrypt(message) {
    const publicKeyPem = `
        -----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxG1zt7VW/VNk1KJC7AuoInrMZKTf0h6S6xBaROgCz8F3xdEIwdTBGrjUKIhIFCeDr6esfiVxUpdCdiRtqaCS9IdXO+9Fs2l6fx6oGkAA9pnxIWL7bw5vAxyK+liu7BToMFhUdiyRdB6erC1g/fwDVBywCWhY4wCU2/TSsTBDQhuGZzy+hmZGEB0sqgZbbJpeosW87dNZFomn/uGhfCDJzswjS/x0OXD9yyk5TEq3QEvx5pWCcBJqAoBfDDQy5eT3RR5YBGDJODHqW1c2OwwdrybEEXKI9RCZmsNyIs2eZn1z1Cw1AdR+owdXqbJf9AnM3e1CN8GcpWLDyOnaRymLgQIDAQAB
        -----END PUBLIC KEY-----
    `;
    const key = new NodeRSA(publicKeyPem, 'pkcs8-public', {
        encryptionScheme: 'pkcs1'
    });
    const messageBuffer = Buffer.from(message, 'utf-8');
    const encrypted = key.encrypt(messageBuffer, 'base64');
    return encrypted;
}

/**
 * 使用GET请求并附带Cookies发送HTTP请求
 * 
 * @param {string} url - 请求的URL
 * @param {string} cookies - 用于请求的Cookie字符串
 * @returns {Promise<Object>} 包含响应数据的Promise对象
 */
export async function getRequestWithCookies(url, cookies) {
    const response = await axios.get(url, { 
        headers: { ...header, 'Cookie': cookies } 
    });
    return response;
}

/**
 * 发送不带Cookies的GET请求
 * 
 * @param {string} url - 请求的URL
 * @returns {Promise<Object>} 包含响应数据的Promise对象
 */
export async function getRequestWithoutCookies(url) {
    const response = await axios.get(url, { 
        headers: header 
    });
    return response;
}

/**
 * 使用POST请求并附带Cookies和负载发送HTTP请求
 * 
 * @param {string} url - 请求的URL
 * @param {string} cookies - 用于请求的Cookie字符串
 * @param {Object} payload - 发送的请求负载
 * @returns {Promise<Object>} 包含响应数据的Promise对象
 */
export async function postRequestWithCookies(url, cookies, payload) {
    const response = await axios.post(url, payload, {
        headers: { ...header, 'Cookie': cookies }
    });
    return response;
}

/**
 * 发送不带Cookies的POST请求
 * 
 * @param {string} url - 请求的URL
 * @param {Object} payload - 发送的请求负载
 * @returns {Promise<Object>} 包含响应数据的Promise对象
 */
export async function postRequestWithoutCookies(url, payload) {
    const response = await axios.post(url, payload, {
        headers: header
    });
    return response;
}

/**
 * 从HTTP响应中提取Cookies
 * 
 * @param {Object} response - HTTP响应对象
 * @returns {string} 提取的Cookie字符串
 */
export function extractCookiesFromResponse(response) {
    return response.headers.get('set-cookie')[0];
}
