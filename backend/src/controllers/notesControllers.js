
// 在这个文件中，req 和 res 仅仅是函数的形参 (formal parameters)。
// 它们的名字是约定俗成的，代表了“请求”和“响应”，但它们本身并没有在文件中被定义或导入。
// Express 内部的工作机制 (调用时机)

// 当一个请求到达服务器并匹配到 /api/notes 路径时：

//     Express 框架找到并识别了 router.get("/", getAllNotes) 这一行。

//     Express 框架在内部创建了包含所有请求信息的新 req 对象和包含响应方法的 res 对象。

//     Express 框架使用这些对象作为参数，调用了您的 getAllNotes 函数
// 需要导入 Express (如在 routes 文件中)： 是因为您需要使用 Express 提供的对象或方法，例如 express.Router() 或 express.json()。

//     不需要导入 Express (如在 controllers 文件中)： 是因为您在控制器中使用的 req 和 res 变量，并不是来自 Express 模块本身，而是 Express 框架在运行时动态创建并注入到您函数中的局部参数。

// 控制器文件的职责是纯粹的业务逻辑，它不需要知道自己是如何被调用的，也不需要直接使用 Express 的构建工具，只需要接收 req 和 res 参数来完成工作即可。

export function getAllNotes(req, res){
    res.status(200).send("欢迎参加大岛优子和我的婚礼");

}

export function createNote(req, res){
    res.status(201).json({message: "Created:欢迎参加大岛优子和我的婚礼"});
}

export function updateNote(req, res){
    
    res.status(200).json({message: "Updated:欢迎参加大岛优子和我的婚礼"});
}

export function deleteNote(req, res){
    
    res.status(200).json({message: "Deleted:欢迎参加大岛优子和我的婚礼"});
}