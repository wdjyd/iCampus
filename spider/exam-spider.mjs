import { getRequestWithCookies } from '../utils/helpers.mjs';
import { Exam } from '../utils/models.mjs';

/**
 * 执行爬虫接口
 *
 * @param {string} appCookies - 用于请求的Cookie字符串
 * @returns {Promise<string>} 包含考试安排信息的JSON字符串
 */
export async function execute(appCookies) {
    const result = await getExamInfo(appCookies);
    return result;
}

/**
 * 获取所有考试安排的详细信息，并保存为JSON文件。
 *
 * @param {string} appCookies - 用于请求的Cookie字符串
 * @returns {Promise<string>} 包含考试安排信息的JSON字符串
 */
async function getExamInfo(appCookies) {  
    // 登录kcmc网站，获取考试安排信息
    const examUrl = "https://app.ucas.ac.cn/exam/wap/default/info?kcmc="
    const examResponse = await getRequestWithCookies(examUrl, appCookies);

    const examData = examResponse.data;
    const exams = [];

    // 遍历考试安排数据，构建考试对象并添加到考试列表中
    for (let key in examData.d) {
        const value = examData.d[key];
        const exam = new Exam({
            courseId: "",
            courseName: value["course_name"],
            method: value["exame_type"],
            campus: null,
            location: value["location"],
            time: `${value['exame_start_time']} - ${value['exame_end_time']}`,
            seat: null
        });
        exams.push(exam);
    }

    const result = {
        'code': 1,
        'data': exams
    };
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}
