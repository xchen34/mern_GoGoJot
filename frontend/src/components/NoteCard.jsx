import { PenSquareIcon, Trash2Icon } from 'lucide-react'
import { Link } from "react-router"
import api from "../lib/axios"
import { formatDate } from '../lib/utils'
import toast from "react-hot-toast"


const NoteCard = ({note, setNotes}) => {
  
  const handleDelete = async (e, id) => {
    e.preventDefault(); //get rid of the navigation behavior


    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
        await api.delete(`/notes/${id}`);
        setNotes((prev)=> prev.filter(note => note._id !== id)); //get rid of the deleted one
        toast.success("Note deleted successfully");
    } catch (error) {
        console.log("Error in handleDelete鸭鸭鸭", error);
        toast.error("Failed to delete note");
    }
    finally{}
  }
  
  
    return (
    <Link to={`/note/${note._id}`}
        className = "card bg-base-100 hover:shadow-lg transition-all duration-200 border-t-4 border-solid border-[#00FF9D]"
        >
        <div className="card-body">
            <h3 className="card-title text-base-content truncate">{note.title}</h3>
            <p className="text-base-content/70 line-clamp-3">{note.content}</p>
            <div className="card-actions justify-between items-center mt-4">
                <span className="text-sm text-base-content/60">{formatDate(new Date(note.createdAt))}</span>
                <div className="flex items-center gap-1">
                    <PenSquareIcon className="size-4" />
                    <button className="btn btn-ghost btn-xs text-error" onClick={(e)=> handleDelete(e, note._id)}>
                        <Trash2Icon className="size-4" />
                    </button>
                </div>
            </div> 
        </div>
    </Link>
            
            )
}

export default NoteCard


//onClick 里面接受的是什么？
// 结论一句话
// React 会自动把“点击事件对象”传进来
// 也就是这个 e 👇
// e === React 的点击事件对象（SyntheticEvent）
// 你 不用自己传，React 帮你传。
// 什么时候需要传e，什么时候不需要？
// 场景	要不要 e
// <form onSubmit>	✅ 要
// <a> / <Link>	有时
// <button onClick>	❌ 一般不需要
// 阻止默认行为	✅ 需要
// 八、给你一个“判断口诀”（非常好用）

// 只要你没写 preventDefault / stopPropagation，
// 就不要传 e

// 九、你现在这行代码可以“更好”的版本 ✅
// onClick={() => handleDelete(note_id)}


// 函数：

// const handleDelete = async (note_id) => {
//   try {
//     await api.delete(`/notes/${note_id}`);
//     toast.success("Deleted");
//   } catch (err) {
//     toast.error("Delete failed");
//   }
// };




// setNotes((prev) => prev.filter(...)) 这一行是在干嘛？
// 这行代码的作用是：从笔记列表里“删掉”某一条笔记。
// 拆解语法：
//     setNotes: 这是 React 修改数据的方法。
//     (prev) => ...: 这叫“函数式更新”。prev 代表修改之前的那一堆笔记（previous state）。
//     .filter(): 这是 JavaScript 数组的一个内置方法，它的意思是“过滤/筛选”。它会创建一个新数组，里面只留下符合条件的项。
//     note => note.id !== id: 这是筛选条件。
//         翻译：对于列表里的每一条笔记（note），如果它的 id 不等于 我要删掉的那个 id，就让它留下。
//         结果：那个 id 相等的笔记就被“过滤”掉了（删除了）。
// 大白话总结： “亲爱的 React，请看一眼我现在的笔记列表 (prev)，把里面那个 ID 为某某的笔记踢出去，剩下的笔记组成一个新列表，然后更新我的状态。”



//    key={note.id}    note={note}    setNotes={setNotes}    key note setnote这里是什么东西  
// 这三行其实是你在给子组件（NoteCard）“快递包裹”。
// 在 React 中，我们把这些统称为 Props（属性）。子组件 NoteCard 就像一个打工人，它本身不知道要显示什么，也不知道怎么删除，全靠父组件通过这三个“包裹”把信息传给它。
// 我们可以用**“入职发装备”**来打个比方：
// 1. key={note.id} —— 员工工牌（React 专用的标签）
//     它是啥： 这是一个特殊的属性，是给 React 内部看的。
//     作用： 就像给每个员工发一个唯一的工牌。当列表顺序变了，React 看一眼工牌就知道“哦，是 1 号挪到了 3 号的位置”，而不用把整栋大楼拆了重建。
//     注意： 在 NoteCard 组件内部，你是拿不到这个 key 的值的，它是 React 的私有管理工具。
// 2. note={note} —— 工作内容（数据）
//     语法解释： 左边的 note 是包裹的名字，右边的 {note} 是包裹里的具体内容（即当前那条笔记的对象，包含标题、内容等）。
//     作用： 告诉这个卡片：“嘿，你负责展示这条笔记的信息”。
//     子组件怎么用： 子组件会通过 props.note.title 之类的方式把字印在页面上。
// 3. setNotes={setNotes} —— 权限遥控器（函数）
//     语法解释： 左边是给遥控器起的名，右边是父组件手里那个真正的 setNotes 函数。
//     作用： 这是一个“修改权限”。因为在 React 里，子组件不能直接修改父组件的数据。
//     形象理解： 父组件说：“我把修改笔记列表的遥控器借给你用一下。如果你卡片上的‘删除’按钮被按了，你就按一下这个遥控器，我会自己在后台把数据删掉。”
// 为什么长得这么奇怪？（左边 = {右边}）
// 你可能会觉得 note={note} 这种写法很绕。其实它的结构是：
// 属性名={变量值}
//     左边的名字：是你自定义的。如果你写 apple={note}，那子组件就得通过 props.apple 来拿数据。但为了好记，大家通常起一样的名字。
//     右边的大括号：就是我们最开始说的 JSX 插值语法。它告诉 React：“去内存里找那个叫 note 的变量，把它塞进左边这个属性里。