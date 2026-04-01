import React from 'react'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, LoaderIcon, PenSquareIcon, Trash2Icon } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Link } from 'react-router-dom';



const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const MAX_TITLE_LENGTH = 100;
  const MAX_CONTENT_LENGTH = 5000;
  
  const navigate = useNavigate(); //usenavigate 是 React Router 提供的一个 Hook，用于在函数组件中进行编程式导航。它返回一个 navigate 函数，可以用来改变当前的 URL，从而实现页面跳转。 navigate('/path') 会导航到指定路径。
  
  const { id } = useParams(); //useparams 是 React Router 提供的一个 Hook，用于在函数组件中访问 URL 参数。它返回一个包含当前路由参数的对象，允许你获取动态路由中的参数值，例如 /note/:id 中的 id。路由定义: <Route path="/notes/:id" />
//前 URL: /notes/123  id = 123    


  useEffect(()=> {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      } catch (error){
        console.log("Error in fetching note鸭鸭鸭", error);
        toast.error("Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);
  
    const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!note?.title?.trim() || !note?.content?.trim()) {
      toast.error("Please add a title or content");
      return;
    }
    
    if (note.title.length > MAX_TITLE_LENGTH) {
      toast.error(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    if (note.content.length > MAX_CONTENT_LENGTH) {
      toast.error(`Content must be less than ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setSaving(true);

    try {
      await api.put(`/notes/${id}`, note);
      toast.success("Note updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the note:", error);
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

 //开始处理笔记的UI渲染
  if (loading) {
    return(
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <LoaderIcon className='animate-spin size-10'/>
    </div>
    );}
   // 添加 null 检查
  if (!note) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Note not found</p>
          <Link to="/" className="btn btn-primary">Back to notes</Link>
        </div>
      </div>
    )
  }
  return (
    <div className='min-h-screen bg-base-200'>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className='btn btn-ghost'>
              <ArrowLeftIcon className='h-5 w-5'/>
              Back to notes
            </Link>
            <div className="flex gap-2">
              {isEditing && (
                <button onClick={() => setIsEditing(false)} className="btn btn-ghost">
                  Cancel
                </button>
              )}
              <button onClick={handleDelete} className="btn btn-error btn-outline">
                <Trash2Icon className='h-5 w-5' />
                Delete Note
              </button>
            </div>
          </div>
         <div className="card bg-base-100">
            <div className="card-body">
              {!isEditing && (
                <div className="mb-4 pb-4 border-b border-base-content/10">
                  <p className="text-sm text-base-content/60">Created on {formatDate(new Date(note.createdAt))}</p>
                </div>
              )}
              <div className="form-control mb-4">
                {isEditing && (
                  <label className="label">
                    <span className="label-text">Title</span>
                    <span className='label-text-alt text-base-content/50'>
                      {note.title.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </label>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Note title"
                    className="input input-bordered"
                    value={note.title}
                    maxLength={MAX_TITLE_LENGTH}
                    onChange={(e) => setNote({ ...note, title: e.target.value })}
                  />
                ) : (
                  <div className="px-4 py-2 text-2xl font-semibold text-base-content">
                    {note.title}
                  </div>
                )}
              </div>

              <div className="form-control mb-4">
                {isEditing && (
                  <label className="label">
                    <span className="label-text">Content</span>
                    <span className='label-text-alt text-base-content/50'>
                      {note.content.length}/{MAX_CONTENT_LENGTH}
                    </span>
                  </label>
                )}
                {isEditing ? (
                  <textarea
                    placeholder="Write your note here..."
                    className="textarea textarea-bordered h-32"
                    value={note.content}
                    maxLength={MAX_CONTENT_LENGTH}
                    onChange={(e) => setNote({ ...note, content: e.target.value })}
                  />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-base-content/90 bg-base-200/40 rounded-lg p-4">
                    {note.content}
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="card-actions justify-end">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-circle btn-primary"
                    aria-label="Edit note"
                    title="Edit note"
                  >
                    <PenSquareIcon className="h-5 w-5" />
                  </button>
                </div>
              )}

              {isEditing && (
                <div className="card-actions justify-end">
                  <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default NoteDetailPage



// State 是 React 中管理组件数据的核心概念。它是一个对象，用来存储组件内部的动态数据。当 state 改变时，React 会自动重新渲染组件，更新界面显示最新的数据。

// State 的工作原理
// 在你的代码中，useState hook 用来创建 state 变量：

// note 存储笔记数据
// loading 追踪加载状态
// saving 追踪保存状态
// 当你调用 setNote(newData) 时，React 检测到状态改变，自动重新渲染组件，UI 就会更新。

// State 重要吗？
// 是的，非常重要。 State 是 React 的基础：

// 数据驱动界面 — 组件的显示内容完全由 state 决定
// 交互性 — 用户交互（点击、输入）更新 state，界面随之改变
// 组件通信 — 父组件通过 props 传递数据给子组件
// 应用逻辑 — 业务逻辑通常围绕 state 管理展开
// 你的代码示例
// 你的 NoteDetailPage 使用三个 state 变量实现了一个典型的数据加载流程：

// 组件挂载时，loading: true 表示正在获取笔记
// 获取完成后，设置 note 数据，loading: false
// 用户编辑后点击保存，saving: true，保存完成后 saving: false
// 总结：理解和掌握 state 是学习 React 的关键，是构建任何动态交互应用的必需知识。


// Hook 是什么：Hook 是 React 提供的函数式组件专用 API，用于在不编写 class 的情况下使用 state、生命周期、副作用等功能（例如 useState, useEffect）。
// useState 是函数吗：是的，useState 是一个函数（Hook）。调用后返回一个数组，包含当前 state 值和更新该值的 setter 函数。
// 前面的 [] 是什么：这是数组解构赋值。const [note, setNote] = useState(null) 表示从 useState 返回的数组中，第一项赋值给 note（当前值），第二项赋值给 setNote（更新


//useEffect参数：
// 第一个参数（必需）：一个函数（effect 函数），包含副作用逻辑
// 第二个参数（可选）：依赖数组，控制 effect 何时运行
// 不传：每次渲染都运行
// []：仅在组件挂载时运行一次
// [dep1, dep2]：当依赖项变化时运行
// 返回值：effect 函数可以返回一个清理函数（cleanup function），用于清理副作用

// 你在 useEffect 中定义了 fetchNote 函数并立即调用它。这是处理异步操作的标准模式。
// 为什么要这样做？
// 原因 1：useEffect 不能直接是 async 函数
// useEffect 的回调函数不能是 async，因为 async 函数返回 Promise，而 useEffect 只期望返回一个清理函数或 undefined。
// 完整流程
// 组件挂载或 id 变化 → useEffect 运行
// 定义 fetchNote 函数 → 包含所有异步逻辑
// 调用 fetchNote() → 执行 API 请求
// 等待响应 → await api.get()
// 更新 state → setNote(res.data) 触发重新渲染
