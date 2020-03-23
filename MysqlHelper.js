var mysql = require('mysql');

/**
 * 构造器 默认连接本地库，如想变成通用Helper，请加参。
 * 本Helper的对象单位是表。
 * 类的对象为：
 * conn -> Object -> mysql的Connection
 * table -> String -> 表名
 */
class MysqlHelper {
    /**
     * 
     * @param {String} database - 数据库名
     * @param {String} table  - 表名
     */
    constructor(database, table) {
        this.conn = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "19990529",
            port: "3306",
            database: database
        });
        this.table = table;
    }
    /**
     * 构造成功后需执行该方法才能正常使用。
     * 该方法封装了连接方法。
     */
    baseBegin() {
        this.conn.connect((err)=>{
            if (err) {
                console.log(this.table+" 链接失败");
                logger.info("error when connecting to db,reConnecting after 2 seconds:", err);
                setTimeout(connect, 2000);
                return;
            }
            console.log(this.table+" 链接成功");
            setInterval(() => {
                console.log('ping...');
                this.conn.ping((err) => {
                    if (err) {
                        console.log('ping error: ' + JSON.stringify(err));
                    }
                });
            }, 3600000);
        })
    }
    /**
     * 插入一条记录
     * @param {Object} insertObj - 插入的对象键值对。
     * @param {Function} callback - 回调函数，异步操作。
     */
    insertOne(insertObj, callback) {
        var addKey = [];
        var addVal = [];
        //解析insertObj对象，拆分为数组方便后续处理
        for (let i in insertObj) {
            addKey.push(i);
            addVal.push(insertObj[i]);
        }
        //键值对不匹配，返回错误文档。
        if (addKey.length != addVal.length) { return console.log("调用insert错误，请检查列和值数目是否匹配" + insertObj) }
        //拼接SQL字符串
        var str = `insert into ${this.table} (`;
        for (let i = 0; i < addKey.length; i++) {
            str += addKey[i] + ",";
        }
        str = str.substr(0, str.length - 1);
        str += ") values (";
        //判断value类型，Mysql区分数字和字符
        for (let i = 0; i < addVal.length; i++) {
            if (typeof (addVal[i]) == "string")
                str += "'" + addVal[i] + "',";
            else
                str += +addVal[i] + ",";
        }
        str = str.substr(0, str.length - 1);
        str += ");";
        //真查询+异步回调
        this.conn.query(str, function (err, field) {
            callback(err, field);
        })
    }
    /**
     * 通过ID查询一条记录
     * @param {Number} id - 查询ID
     * @param {Function} callback - 回调函数
     */
    findArrayById(id, callback) {
        var str = `select * from ${this.table} where id = ${id}`
        this.conn.query(str, function (err, result, field) {
            callback(err, result, field);
        });
    }
    /**
     * 键入对象查询相似数据
     * @param {Object} queryObj - 查询对象
     * @param {Function} callback - 回调函数
     */
    find(queryObj, callback) {
        var str = "";
        if (queryObj == {}) {
            str = `select * from ${this.table}`
        }
        else {
            str = `select * from ${this.table} where `;
            // 区分类型
            for (var i in queryObj) {
                if (typeof (queryObj[i]) == "string") {
                    str += `${i}='${queryObj[i]}' and `;
                }
                else {
                    str += `${i}=${queryObj[i]} and `;
                }
            }
            // 清除最后的多余字段
            str = str.substr(0, str.length - 4);
        }
        this.conn.query(str, function (err, result, field) {
            callback(err, result, field);
        })
    }
    /**
     * 单条数据更新通过ID定位数据，通过upOBJ更新数据
     * @param {Number} Kid - 定位ID
     * @param {Object} updateObj - 更新数据对象
     * @param {Function} callback - 回调函数
     */

    updateOne(Kid, updateObj, callback) {
    //注意，这里的updateObj没必要把所有参数穿进去，只要把需要更新的字段和值传进来就可以，Kid就可以帮你补全剩下的数据了
        this.findArrayById(Kid, (err, result) => {
            //获取旧数据，比较新旧数据的键是否匹配
            var oldData = result[0];
            var str = `update ${this.table} set `;
            for (let u in updateObj) {
                //用旧数据的键比对传参的键
                if (oldData[u] == undefined) return console.log("输入的键错误，请检查update：" + updateObj);
                oldData[u] = updateObj[u];
            }
            //区分类型
            for (let o in oldData) {
                if (typeof (oldData[o]) == 'string')
                    str += `${o} = '${oldData[o]}',`;
                else
                    str += `${o} = ${oldData[o]},`;
            }
            str = str.substr(0, str.length - 1);
            str += ` where id=${Kid}`;
            this.conn.query(str, function (err, field) {
                callback(err, field);
            })
        })
    }
    /**
     * 
     * @param {Number} Kid - 定位ID
     * @param {Function} callback - 回调函数
     */
    deleteOne(Kid, callback) {
        var str = `delete from ${this.table} where id = ${Kid}`;
        this.conn.query(str, function (err, field) {
            callback(err, field);
        })
    }
    SQL(str,callback){
        this.conn.query(str,function(err,field){
            callback(err,field);
        });
    }
}
exports.MysqlHelper = MysqlHelper;
