import { ArrowLeftIcon } from 'lucide-react';
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../lib/axios';


const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault();  //防止浏览器刷新 你能看到console React接管逻辑
    
    if (!title.trim() || !content.trim()){   //去掉title前后的空格再检查空 防止纯空格被识别成true
      toast.error("ALl fields are required");
    }
    setLoading(true)   //setLoading(true) 表示：前端正在等待与后端的交互结果（请求进行中）
    try{
      // await axios.post("http://localhost:5001/api/notes", {
      //   title,
      //   content
      // })
      await api.post("/notes",{
        title,
        content
      })
      toast.success("Note created successfully!")
      navigate("/");
    } catch(error)
    {
      console.log("Error creating note 鸭鸭鸭", error);
      if (error.response?.status == 429){
        toast.error("Slow down! You're creating notes too fast",
        {duration: 4000,
        icon: "XXXX",
        });   //toast.error第二个参数控制错误提示怎么显示 这里会显示4s
      } else {
        toast.error("Failed to create note.")
          }
      } finally {
      setLoading(false)  //loading必须有结束 finally无论前面是什么return都会执行
    }


  };
  //这里的 e 是：
// Event（事件对象）
// 当你做一件事时：
// 点击
// 输入
// 提交表单
// 浏览器会自动创建一个对象，把这次行为的所有信息装进去，然后传给你。
// 二、e 里面都有什么？（常用）
// 你不用全记，记几个最重要的就行：
// 属性	是什么
// e.target	触发事件的元素
// e.target.value	输入框的内容
// e.preventDefault()	阻止默认行为
// e.type	事件类型（click / submit）
  return (
    <div className = "min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>
    
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Note</h2>
              <form onSubmit={handleSubmit}>
                <div className='form-control mb-4'>
                  <label className='label'>
                    <span className='label-text'>Title</span>
                  </label>
                  <input 
                    type="text"
                    placeholder='Note Title'
                    className='input input-bordered'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className='form-control mb-4'>
                  <label className='label'>
                    <span className='label-text'>Content</span>
                  </label>
                  <textarea
                    placeholder='Write your note here...'
                    className='textarea textarea-bordered h-32'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                <div className='card-actions justify-end'>
                  <button type='submit' className='btn btn-primary' disabled={loading}>
                    {loading ? "Creating..." : "Create Note"}
                   </button> 
                </div>
             
             
              </form>           


            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePage



//onChange={} 代表当输入框内容发生改变时执行
//(e) 是事件对象event  包括谁触发的时间 输入框当前值 鼠标/键盘信息 
// e.target是触发事件的那个DOM元素 比如若是在<input onChange={...}/>那么target就是input
//value是表单元素当前的值 



// 用户点击「Create Note」
//  → 前端发请求给后端
//  → 等待后端处理
//  → 后端返回结果
//  → 前端更新页面
// setLoading(true);   // ⏳ 开始等待
// await apiCall();   // 🔄 前后端交互
// setLoading(false); // ✅ 等待结束
// 为什么一定要有 loading 状态？
// 如果没有：
// 用户可以疯狂点按钮
// 会发送多个请求
// 可能创建多条重复数据
// UI 看起来像“没反应”