/**
 * Exam 类表示考试信息，定义了与前端界面交互的数据格式
 */
export class Exam {
    constructor(courseId, courseName, method, campus, location, time, seat) {
      this.courseId = courseId;
      this.courseName = courseName;
      this.method = method;
      this.campus = campus;
      this.location = location;
      this.time = time;
      this.seat = seat;
    }
  
    toJSON() {
        return {
            courseId: this.courseId,
            courseName: this.courseName,
            method: this.method,
            campus: this.campus,
            location: this.location,
            time: this.time,
            seat: this.seat
        };
    }
}

/**
 * Course 类表示课程信息，定义了与前端界面交互的数据格式
 */
export class Course {
    constructor({id, courseId, courseName, courseLocation, courseOrder, courseWeekday, courseTeacher, userCourse,
                    startTime, endTime, courseWeeks, courseIndex, academy, credit, remaining, category, courseInfo, examType}) {
        this.id = id;
        this.courseId = courseId;
        this.courseName = courseName;
        this.courseLocation = courseLocation;
        this.courseOrder = courseOrder;
        this.courseWeekday = courseWeekday;
        this.courseTeacher = courseTeacher;
        this.userCourse = userCourse;
        this.startTime = startTime;
        this.endTime = endTime;
        this.courseWeeks = courseWeeks;
        this.courseIndex = courseIndex;
        this.academy = academy;
        this.credit = credit;
        this.remaining = remaining;
        this.category = category;
        this.courseInfo = courseInfo;
        this.examType = examType;
    }
      
    toJSON() {
        return {
            id: this.id,
            courseId: this.courseId,
            courseName: this.courseName,
            courseLocation: this.courseLocation,
            courseOrder: this.courseOrder,
            courseWeekday: this.courseWeekday,
            courseTeacher: this.courseTeacher,
            userCourse: this.userCourse,
            startTime: this.startTime,
            endTime: this.endTime,
            courseWeeks: this.courseWeeks,
            courseIndex: this.courseIndex,
            academy: this.academy,
            credit: this.credit,
            remaining: this.remaining,
            category: this.category,
            courseInfo: this.courseInfo,
            examType: this.examType
        };
    } 
}

/**
 * Grade 类表示成绩信息，定义了与前端界面交互的数据格式
 */
export class Grade {
    constructor({courseId, courseParam, courseName, dailyScore, examScore, totalScore,
                level, credit, gpa, highestScore, lowestScore, type, semester}) {
        this.courseId = courseId;
        this.courseParam = courseParam;
        this.courseName = courseName;
        this.dailyScore = dailyScore;
        this.examScore = examScore;
        this.totalScore = totalScore;
        this.level = level;
        this.credit = credit;
        this.gpa = gpa;
        this.highestScore = highestScore;
        this.lowestScore = lowestScore;
        this.type = type;
        this.semester = semester;
    }
  
    toJSON() {
        return {
            courseId: this.courseId,
            courseParam: this.courseParam,
            courseName: this.courseName,
            dailyScore: this.dailyScore,
            examScore: this.examScore,
            totalScore: this.totalScore,
            level: this.level,
            credit: this.credit,
            gpa: this.gpa,
            highestScore: this.highestScore,
            lowestScore: this.lowestScore,
            type: this.type,
            semester: this.semester
        };
    }
}

/**
 * Book 类表示图书信息，定义了与前端界面交互的数据格式
 */
export class Book {
    constructor({bookId, title, author, collectionCount, freeCount, publisher, publishYear,
                theme, isbn, digest, collections}) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.collectionCount = collectionCount;
        this.freeCount = freeCount;
        this.publisher = publisher;
        this.publishYear = publishYear;
        this.theme = theme;
        this.isbn = isbn;
        this.digest = digest;
        this.collections = collections;
    }
  
    toJSON() {
        return {
            bookId: this.bookId,
            title: this.title,
            author: this.author,
            collectionCount: this.collectionCount,
            freeCount: this.freeCount,
            publisher: this.publisher,
            publishYear: this.publishYear,
            theme: this.theme,
            isbn: this.isbn,
            digest: this.digest,
            collections: this.collections
        };
    }
}

/**
 * BookCollection 类表示馆藏信息，定义了与前端界面交互的数据格式
 */
export class BookCollection {
    constructor({ callNo, barcode, location, status }) {
        this.callNo = callNo;
        this.barcode = barcode;
        this.location = location;
        this.status = status;
    }
  
    toJSON() {
        return {
            callNo: this.callNo,
            barcode: this.barcode,
            location: this.location,
            status: this.status
        };
    }
}