import {
    getRequestWithCookies
 } from '../utils/helpers.mjs';
import { Book, BookCollection } from '../utils/models.mjs';

/**
 * 执行爬虫接口
 *
 * @param {string} libCookies - 用于请求的Cookie字符串
 * @param {string} bookName - 要查询的图书名
 * @returns {Promise<string>} 包含图书信息的JSON字符串
 */
export async function execute(libCookies, bookName) {
    const result = await getBookInfo(libCookies, bookName);
    return result;
}

/**
 * 获取指定图书的详细信息，包括基本信息和馆藏信息，并保存为JSON文件。
 *
 * @param {string} libCookies - 用于请求的Cookie字符串
 * @param {string} bookName - 要搜索的图书名称
 * @returns {Promise<string>} 包含图书信息的JSON字符串
 */
async function getBookInfo(libCookies, bookName) {
    // 构建搜索 URL 并发送请求
    const searchUrl = `https://lib.ucas.ac.cn/front/book/list?searchValue=${bookName}&searchField=all`;
    const searchResponse = await getRequestWithCookies(searchUrl, libCookies);

    // 从搜索结果中提取图书的详情页 ID
    const detailIdList = extractDetailIdFromHtml(searchResponse.data);
    var bookList = [];

    // 遍历详情页 ID 列表，获取每个图书的详细信息
    for (let i = 0; i < detailIdList.length; i++) {
        const detailUrl = `https://lib.ucas.ac.cn/front/book/detail?id=${detailIdList[i]}`;
        const detailResponse = await getRequestWithCookies(detailUrl, libCookies);

        // 解析出图书的标题、出版社、ISBN、出版年份、作者、领域等信息
        const bookDetailData = extractBookInfoFromHtml(detailResponse.data);

        // 提取馆藏信息
        const collectionUrl = extractSourceIdAndBuildUrl(detailResponse.data);
        const collectionResponse = await getRequestWithCookies(collectionUrl, libCookies);
        const collections = extractCollectionInfoFromString(collectionResponse.data);

        // 创建 Book 对象
        const bookData = new Book({
            bookId: detailIdList[i],
            title: bookDetailData['title'],
            author: bookDetailData['author'],
            collectionCount: countCollections(collections),
            freeCount: countFreeCollections(collections),
            publisher: bookDetailData['publisher'],
            publishYear: bookDetailData['year'],
            theme: "",
            isbn: bookDetailData['isbn'],
            digest: "",
            collections: collections,
        });
        bookList.push(bookData);
    }

    const result =  {
        'code': 1,
        'data': bookList
    };
    const resultJson = JSON.stringify(result, null, 4);
    return resultJson;
}

/**
 * 从HTML字符串中提取图书的detail ID
 * 
 * @param {string} htmlString - 包含HTML内容的字符串
 * @returns {Array<string>} 提取的唯一ID数组
 */
function extractDetailIdFromHtml(htmlString) {
    const regex = /href="\/front\/book\/detail\?id=([a-z0-9]+)"/g;
    const matches = [];
    let match;
    while ((match = regex.exec(htmlString)) !== null) {
        matches.push(match[1]);
    }
    var uniqueMatches = [...new Set(matches)];
    return uniqueMatches;
}

/**
 * 从HTML字符串中提取图书的sourceId并构建URL
 * 
 * @param {string} htmlString - 包含HTML内容的字符串
 * @returns {string|null} 构建的新URL或null
 */
function extractSourceIdAndBuildUrl(htmlString) {
    var sourceIdRegex = /var sourceId="([^"]+)"/;
    var match = sourceIdRegex.exec(htmlString);
    if (match && match.length > 1) {
        var sourceId = match[1];
        var baseUrl = "https://lib.ucas.ac.cn/front/book/getShelfState?sourceId=";
        var newUrl = baseUrl + encodeURIComponent(sourceId);
        return newUrl;
    } else {
        console.error("无法从HTML代码中提取sourceId的值。");
        return null;
    }
}

/**
 * 从HTML字符串中提取书籍信息
 * 
 * @param {string} htmlString - 包含HTML内容的字符串
 * @returns {Object} 包含书籍信息的对象
 */
function extractBookInfoFromHtml(htmlString) {
    // 使用正则表达式匹配标题
    var titleRegex = /<h4 class="media-heading">([^<]*)<\/h4>/;
    var titleMatch = htmlString.match(titleRegex);
    var title = titleMatch ? titleMatch[1] : null;

    // 使用正则表达式匹配出版社
    var publisherRegex = /<b>出版社：<\/b><span>([^<]*)<\/span>/;
    var publisherMatch = htmlString.match(publisherRegex);
    var publisher = publisherMatch ? publisherMatch[1] : null;

    // 使用正则表达式匹配ISBN
    var isbnRegex = /<b>ISBN：<\/b><span>([^<]*)<\/span>/;
    var isbnMatch = htmlString.match(isbnRegex);
    var isbn = isbnMatch ? isbnMatch[1] : null;

    // 使用正则表达式匹配出版年
    var yearRegex = /<b>出版年：<\/b><span>([^<]*)<\/span>/;
    var yearMatch = htmlString.match(yearRegex);
    var year = yearMatch ? yearMatch[1] : null;

    // 使用正则表达式匹配作者
    var authorRegex = /<b>作者：<\/b><span>([^<]*)<\/span>/;
    var authorMatch = htmlString.match(authorRegex);
    var author = authorMatch ? authorMatch[1] : null;

    // 使用正则表达式匹配学科
    var subjectRegex = /<b>学科：<\/b><span>([^<]*)<\/span>/;
    var subjectMatch = htmlString.match(subjectRegex);
    var subject = subjectMatch ? subjectMatch[1] : null;

    // 返回包含书籍信息的对象
    return {
        title: title,
        publisher: publisher,
        isbn: isbn,
        year: year,
        author: author,
        subject: subject
    };
}

/**
 * 从书籍数组中提取馆藏信息并生成BookCollection实例列表
 * 
 * @param {Array} books - 书籍数组，每个书籍对象包含馆藏信息
 * @returns {Array<BookCollection>} BookCollection实例列表
 */
function extractCollectionInfoFromString(books) {
    return books.map(book => new BookCollection({
        callNo: book.callNo1,
        barcode: book.barcode,
        location: book.subLibrary + book.locationDetail,
        status: book.loanStatus
    }));
}

/**
 * 计算在架上的馆藏数量
 * 
 * @param {Array} collections - 馆藏数组，每个馆藏对象包含一个status属性
 * @returns {number} 在架上的馆藏数量
 */
function countFreeCollections(collections) {
    var count = 0;
    for (let i = 0; i < collections.length; i++) {
        if (collections[i].status == "在架上") {
            count++;
        }
    }
    return count;
}

/**
 * 计算馆藏总数量
 * 
 * @param {Array} collections - 馆藏数组
 * @returns {number} 馆藏总数量
 */
function countCollections(collections) {
    return collections.length;
}
