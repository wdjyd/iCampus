import { 
    getRequestWithCookies, header
 } from '../utils/helpers.mjs';
import { Grade } from '../utils/models.mjs';

import cheerio from 'cheerio';

/**
 * 执行爬虫接口
 *
 * @param {string} appCookies - 用于请求的Cookie字符串
 * @returns {Promise<string>} 包含课程成绩信息的JSON字符串
 */
export async function execute(jwxtCookies) {
    const result = await getGradeInfo(jwxtCookies);
    return result;
}

/**
 * 获取所有课程成绩的详细信息，并保存为JSON文件。
 *
 * @param {string} jwxtCookies - 用于请求的Cookie字符串
 * @returns {Promise<string>} 包含课程成绩信息的JSON字符串
 */
async function getGradeInfo(jwxtCookies) {
    // 需要预登录 https://xkcts.ucas.ac.cn:8443/main, 否则无法登录后续界面
    const jwxtUrl = "https://xkcts.ucas.ac.cn:8443/main";   
    const jwxtResponse = await getRequestWithCookies(jwxtUrl, jwxtCookies);

    // 从成绩查询界面中获取成绩信息
    const gradeUrl = 'https://xkcts.ucas.ac.cn:8443/score/yjs/all';
    const gradeResponse = await getRequestWithCookies(gradeUrl, jwxtCookies);
    const htmlContent = gradeResponse.data;
    

    // 使用 cheerio 解析 成绩查询界面 HTML 内容
    const $ = cheerio.load(htmlContent);

    // 定义包含前置条件的选择器模式
    const tableContent = $('thead tr th').filter((i, el) => $(el).text() === '课程名称').closest('thead').next('tbody');
    const rows = tableContent.find('tr');
    const matches = [];

    // 解析出 成绩查询 HTML 中的相关信息
    rows.each((i, row) => {
        const columns = $(row).find('td');
        const courseData = {
            'courseName': $(columns[0]).text().trim(),
            'englishName': $(columns[1]).text().trim(),
            'score': $(columns[2]).text().trim(),
            'credit': $(columns[3]).text().trim(),
            'type': $(columns[4]).text().trim(),
            'semester': $(columns[5]).text().trim(),
            'assessmentStatus': $(columns[6]).text().trim(),
        };
        matches.push(courseData);
    });

    // 从selectedCourse网站中获取课程ID
    const courseUrl = "https://xkcts.ucas.ac.cn:8443/courseManage/selectedCourse";
    const courseResponse = await getRequestWithCookies(courseUrl, jwxtCookies);
    const courseHtmlContent = courseResponse.data;
    const gradeList = [];

    // 补全成绩数据中的其他信息
    for (const match of matches) {
        const grade = new Grade({
            courseId: extractCourseIdFromHtml(courseHtmlContent, match['courseName']),
            courseParam: "",
            courseName: match['courseName'],
            dailyScore: "",
            examScore: "",
            totalScore: match['score'],
            level: "",
            credit: match['credit'],
            gpa: generateCourseGpa(match['score']),
            highestScore: "",
            lowestScore: "",
            type: generateCourseType(match['type']),
            semester: match['term']
        });
        gradeList.push(grade);
    }
    const result = {
        'code': 1,
        'data': gradeList
    };
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}

/**
 * 根据课程类型字符串生成规定的课程类型
 * 
 * @param {string} courseType - 课程类型
 * @returns {string} 课程类型（是否为学位课）
 */
function generateCourseType(courseType) {
    if (courseType === '否') {
        return "非学位课";
    } else {
        return "学位课";
    }
}

/**
 * 根据课程成绩生成GPA成绩
 * 
 * @param {string} courseScore - 课程成绩
 * @returns {string} 课程GPA分数
 */
function generateCourseGpa(courseScore) {
    // 五级评分制
    const gpaMapping = {
        "优秀": "4",
        "良好": "3.4",
        "及格": "2",
        "不及格": "0",
        "通过": "",
        "不通过": "",
        "补考合格": "1",
        "": ""
    };
    if (courseScore in gpaMapping) {
        return gpaMapping[courseScore];
    }

    // 打分制
    const score = parseInt(courseScore, 10);
    if (isNaN(score)) {
        return null;
    }

    const scoreRanges = [
        { min: 90, max: 100, gpa: "4" },
        { min: 87, max: 89, gpa: "3.9" },
        { min: 85, max: 86, gpa: "3.8" },
        { min: 83, max: 84, gpa: "3.7" },
        { min: 82, max: 82, gpa: "3.6" },
        { min: 80, max: 81, gpa: "3.5" },
        { min: 78, max: 79, gpa: "3.4" },
        { min: 76, max: 77, gpa: "3.3" },
        { min: 75, max: 75, gpa: "3.2" },
        { min: 74, max: 74, gpa: "3.1" },
        { min: 73, max: 73, gpa: "3.0" },
        { min: 72, max: 72, gpa: "2.9" },
        { min: 71, max: 71, gpa: "2.8" },
        { min: 69, max: 70, gpa: "2.7" },
        { min: 68, max: 68, gpa: "2.6" },
        { min: 67, max: 67, gpa: "2.5" },
        { min: 66, max: 66, gpa: "2.4" },
        { min: 64, max: 65, gpa: "2.3" },
        { min: 63, max: 63, gpa: "2.2" },
        { min: 62, max: 62, gpa: "2.1" },
        { min: 61, max: 61, gpa: "1.8" },
        { min: 60, max: 60, gpa: "1.6" }
    ];
    for (const range of scoreRanges) {
        if (score >= range.min && score <= range.max) {
            return range.gpa;
        }
    }
    return "";
}

/**
 * 从HTML字符串中提取课程 ID
 * 
 * @param {string} htmlString - 包含HTML内容的字符串
 * @param {string} courseName - 课程名称
 * @returns {Array<string>} 提取的唯一ID数组
 */
function extractCourseIdFromHtml(htmlString, courseName) {
    // 使用正则表达式查找对应课程名称的课程编码
    var pattern = new RegExp(
        '<td><a href="/course/courseplan/\\d+" target="_blank">([^<]+)</a></td>' +
        '\\s*' +
        '<td><a href="/course/coursetime/\\d+" target="_blank">'+ courseName +'</a></td>', 
        's'
    );

    var match = pattern.exec(htmlString);
    if (match) {
        return match[1];
    }
    return "";
}
