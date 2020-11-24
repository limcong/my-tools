// Lemon——LimCong制作
var mysql = require('mysql');
/**
 * 异步封装，使用时可以用await实现异步方法同步编程
 * @param {Object} conn - 连接池对象
 * @param {String} str - 处理好的sql语句
 * @param {Number} isfind - 是否是查询语句0-不是 1-查询多个 2-id查询
 */
const createAsyncAction = async (conn, str, isFindById = false) => {
    return new Promise((resolve, reject) => {
        conn.query(str, function (err, data, field) {
            // 查询出错，抛出reject
            if (err) {
                reject({ err })
                return
            }
            // 存在第三个参数，是查询语句
            if (field) {
                //是否是id查询
                resolve({ data: isFindById ? data[0] : data, field });
                return
            }
            // 其他语句
            resolve({ field: data });
        })
    })
}
/**
 * 将一个对象的key和value单独拆分成数组
 * @param {Object} splitObject - 被拆分的数组
 */
const splitObjectToArray = function (splitObject) {
    const compositedKey = [], compositedVal = [];

    for (let splitIndex in splitObject) {
        compositedKey.push(splitIndex);
        compositedVal.push(splitObject[splitIndex]);
    }

    return [compositedKey, compositedVal];
}

// 判断一个对象是否为空
const isEmptyObject = (object) => JSON.stringify(object) === '{}';

/**
 * 格式化对象拼接sql语句
 * @param {Object} formatArray - 需要格式化为sql格式的对象
 * @param {String} splitStr - 分隔符
 * @param {Object} beforeObject - 更新时前缀
 */
const formatSql = (formatArray, splitStr, beforeArray = []) =>
    formatArray.map((item, index) =>
        beforeArray.length ? beforeArray[index] + " = " : ""
            + typeof (item) == 'string' ? `'${item}'` : String(item)).join(splitStr);

/**
 * 构造器 默认连接本地库，如想变成通用Helper，请加参。
 * 本Helper的对象单位是表。
 * 类的对象为：
 * conn -> Object -> mysql的Connection
 * tableName -> String -> 表名
 */
class MysqlHelper {
    /**
     * 
     * @param {String} database - 数据库名
     * @param {String} tableName  - 表名
     */
    constructor(database, tableName) {
        // 链接相关数据储备
        this.conn = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "19990529",
            port: "3306",
            database
        });
        // 向外抛出tableName
        this.tableName = tableName;
        // 链接mysql
        this.conn.connect((err) => {
            if (err) {
                console.log(this.tableName + " 链接失败,将于两秒后重连");
                // 链接失败两秒后重连
                setTimeout(this.conn.connect, 2000);
                return;
            }
            // 链接成功
            console.log(this.tableName + " 链接成功");
            // 避免长时间无访问断开，做ping
            setInterval(() => {
                console.log(this.tableName + '由于长时间无请求，发起ping');
                this.conn.ping((err) => {
                    if (err) {
                        console.log('ping出错，原因：' + JSON.stringify(err));
                    }
                });
            }, 3600000);
        })
    }

    /**
     * 插入一条记录
     * @param {Object} insertObj - 插入的对象键值对。
     */
    insertOne(insertObj) {
        // 解析insertObj对象，拆分为数组方便后续处理
        const [insertKey, insertVal] = splitObjectToArray(insertObj);

        // 键值对不匹配，返回错误文档。
        if (insertKey.length !== insertVal.length) { return console.log("调用insert错误，请检查列和值数目是否匹配：" + JSON.stringify(insertObj)) }

        // 真查询+异步回调
        return createAsyncAction(this.conn, `insert into ${this.tableName} (${insertKey.join(',')}) values (${formatSql(insertVal, ',')})`)
    }

    /**
     * 通过ID查询一条记录（注意，这里返回的data不是一个数组，而是单纯的一条记录）
     * @param {Number} id - 查询ID
     */
    findArrayById = (id) => createAsyncAction(this.conn, `select * from ${this.tableName} where id = ${id}`, true)

    /**
     * 键入对象查询相似数据,
     * @param {Object} queryObj - 查询对象,为{}时，查询全部数据
     */
    find(queryObj) {
        // 解析queryObj对象，拆分为数组方便后续处理
        const [queryKey, queryVal] = splitObjectToArray(queryObj);

        // 键值对不匹配，返回错误文档。
        if (queryKey.length !== queryVal.length) return console.log("调用find错误，请检查列和值数目是否匹配：" + JSON.stringify(insertObj))

        let str = `select * from ${this.tableName}`;

        // 如果传来的对象不是空，则拼接sql
        if (!isEmptyObject(queryObj)) {
            str += ` where ${formatSql(queryVal, ' and ', queryKey)}`;
        }
        // 返回promise
        return createAsyncAction(this.conn, str)
    }
    /**
     * 单条数据更新通过ID定位数据，通过upOBJ更新数据
     * @param {Number} Kid - 定位ID
     * @param {Object} updateObj - 更新数据对象
     */
    async updateOne(Kid, updateObj) {
        // 注意，这里的updateObj没必要把所有参数穿进去，只要把需要更新的字段和值传进来就可以，Kid就可以帮你补全剩下的数据了
        const { data: oldData } = await this.findArrayById(Kid)
        // 获取旧数据，比较新旧数据的键是否匹配
        for (let u in updateObj) {
            // 用旧数据的键比对传参的键
            if (oldData[u] === undefined) return console.log(u + "输入的键错误，请检查update：" + JSON.stringify(updateObj));
            // 将需要更新的字段替换到旧数据上
            oldData[u] = updateObj[u];
        }
        // 解析oldData对象，拆分为数组方便后续处理
        const [updateKey, updateVal] = splitObjectToArray(oldData);
        // 返回promise
        return createAsyncAction(this.conn, `update ${this.tableName} set ${formatSql(updateVal, ',', updateKey)} where id = ${Kid}`)
    }
    /**
     * 
     * @param {Number} Kid - 定位ID
     */
    deleteOne = (Kid) => createAsyncAction(this.conn, `delete from ${this.tableName} where id = ${Kid}`)

    /**
 * 
 * @param {String} str - 查询的sql语句
 */
    SQL(str) {
        return createAsyncAction(this.conn, str)
    }
}
exports.MysqlHelper = MysqlHelper;