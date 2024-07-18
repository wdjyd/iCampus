import { 
    getRequestWithCookies,
    postRequestWithCookies
 } from '../utils/helpers.mjs';
import { Course } from '../utils/models.mjs';


/**
 * 执行爬虫接口
 *
 * @param {string} appCookies - 用于请求的Cookie字符串
 * @returns {Promise<string>} 包含课程安排信息的JSON字符串
 */
export async function execute(appCookies) {
    const result = await getCourseInfo(appCookies);
    return result;
}

/**
 * 获取所有课程安排的详细信息，并保存为JSON文件。
 *
 * @param {string} appCookies - 用于请求的Cookie字符串
 * @returns {Promise<string>} 包含课程安排信息的JSON字符串
 */
async function getCourseInfo(appCookies) {
    // 登录get-index网站，获得index信息
    const indexUrl = "https://app.ucas.ac.cn/timetable/wap/default/get-index";
    const indexResponse = await getRequestWithCookies(indexUrl, appCookies);
    const indexData = indexResponse.data;
    const indexInfoDict = {
        'year': indexData.d.params.year,
        'term': indexData.d.params.term,
        'startday': indexData.d.params.startday,
        'countweek': indexData.d.params.countweek,
        'week': indexData.d.params.week
    }

    const payload = new URLSearchParams();
    payload.append('year', indexInfoDict['year']);
    payload.append('term', 2);
    payload.append('week', indexInfoDict['week']);
    payload.append('type', 1);

    var schduleList = [];
    var courseIdList = [];
    for (let week = 1; week <= 16; week++) {
        // 登录get-data网站，爬取课表信息
        payload.set('week', week);
        const scheduleUrl = "https://app.ucas.ac.cn/timetable/wap/default/get-data";
        const scheduleResponse = await postRequestWithCookies(scheduleUrl, appCookies, payload);
        const schduleData = scheduleResponse.data;

        // 遍历课表数据，构建课程对象并添加到课程列表中
        for (let index = 0; index < schduleData.d.classes.length; index++) {
            const obj = schduleData.d.classes[index];
            const courseId = obj['course_id'];
            if (courseIdList.includes(courseId)) {
                var courseIndex = courseIdList.indexOf(courseId);
                schduleList[courseIndex]["courseWeeks"].push(week);
            }
            else {
                courseIdList.push(courseId);
                const course = new Course ({
                    id: 0,
                    courseId: courseId,
                    courseName: obj['course_name'],
                    courseLocation: obj['location'],
                    courseOrder: generateCourseOrder(obj['lessons']),
                    courseWeekday: parseInt(obj['weekday'], 10),
                    courseTeacher: obj['teacher'],
                    userCourse: false,
                    startTime: generateClassTimes(generateCourseOrder(obj['lessons'])).split(',')[0],
                    endTime: generateClassTimes(generateCourseOrder(obj['lessons'])).split(',')[1],
                    courseWeeks: [week],
                    courseIndex: 0,
                    academy: "",
                    credit: obj['credit'],
                    remaining: 0,
                    category: obj['course_type'],
                    courseInfo: "",
                    examType: obj['khfs']
                });
                schduleList.push(course);
            }
        }
    }
    // 去除重复的上课周次
    for (let i = 0; i < schduleList.length; i++) {
        let schdule = schduleList[i];
        schdule.courseWeeks = [...new Set(schdule.courseWeeks)];
    }

    const result = {
        'code': 1,
        'data': schduleList
    };
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}

/**
 * 处理原始的上课节数字符串，如将'091011'处理后生成列表[9,10,11]
 * 
 * @param {string} courseOrder - 课程次序
 * @returns {Array} 上课节数
 */
function generateCourseOrder(input) {
    let result = [];
    for (let i = 0; i < input.length; i += 2) {
        let number = parseInt(input.substring(i, i + 2), 10);
        result.push(number);
    }
    return result;
}

/**
 * 根据课程节数生成具体的上课时间，如 '5-7' 对应于时间 '13:30-16:20'
 * 
 * @param {string} courseOrder - 课程次序
 * @returns {string} 上课时间
 */
function generateClassTimes(courseOrder) {
    // 定义每节课的开始和结束时间
    const classTimes = [
      { start: '8:30', end: '9:20' },
      { start: '9:20', end: '10:10' },
      { start: '10:30', end: '11:20' },
      { start: '11:20', end: '12:10' },
      { start: '13:30', end: '14:20' },
      { start: '14:20', end: '15:10' },
      { start: '15:30', end: '16:20' },
      { start: '16:20', end: '17:10' },
      { start: '18:10', end: '19:00' },
      { start: '19:00', end: '19:50' },
      { start: '20:10', end: '21:00' },
      { start: '21:00', end: '21:50' }
    ];
    // 解析输入的节数范围
    const [start, end] = [courseOrder[0], courseOrder[courseOrder.length - 1]];
  
    // 确保节数范围有效
    if (start < 1 || start > 12 || end < 1 || end > 12 || start > end) {
      return '无效的节数范围';
    }
  
    // 计算开始和结束时间
    const startTime = classTimes[start - 1].start;
    const endTime = classTimes[end - 1].end;
  
    // 返回时间范围
    return `${startTime},${endTime}`;
}
