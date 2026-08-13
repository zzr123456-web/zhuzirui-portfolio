import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const categories = {
  expense: [
    { value: '餐饮', icon: '🍜' },
    { value: '交通', icon: '🚗' },
    { value: '购物', icon: '🛍️' },
    { value: '住房', icon: '🏠' },
    { value: '娱乐', icon: '🎮' },
    { value: '医疗', icon: '💊' },
    { value: '教育', icon: '📚' },
    { value: '其他', icon: '📦' }
  ],
  income: [
    { value: '工资', icon: '💰' },
    { value: '奖金', icon: '🎁' },
    { value: '投资', icon: '📈' },
    { value: '兼职', icon: '💼' },
    { value: '其他', icon: '📦' }
  ]
}

export default function AccountingPage() {
  const [currentType, setCurrentType] = useState('expense')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  // 初始化读取记录：try/catch 兜底隐私模式或存储异常
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('accounting_records') || '[]')
    } catch {
      return []
    }
  })
  const [category, setCategory] = useState(categories.expense[0].value)
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [recordDate, setRecordDate] = useState(getTodayStr())

  // 每次 records 变化时写入 localStorage：隐私模式可能抛错，静默失败
  useEffect(() => {
    try {
      localStorage.setItem('accounting_records', JSON.stringify(records))
    } catch {
      // 忽略：本地受限环境下仅保留内存中的记录
    }
  }, [records])

  function getTodayStr() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function getMonthStr(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    return `${y}年${m}月`
  }

  function changeMonth(delta) {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1)
    )
  }

  function isInCurrentMonth(recordDateStr) {
    if (!recordDateStr) return true
    const [y, m] = recordDateStr.split('-').map(Number)
    return y === currentMonth.getFullYear() && m === currentMonth.getMonth() + 1
  }

  function formatDateDisplay(dateStr, timeStr) {
    if (!dateStr) return timeStr || ''
    const [, m, d] = dateStr.split('-')
    const base = `${parseInt(m)}月${parseInt(d)}日`
    if (timeStr) {
      const timePart = timeStr.split(' ').pop()
      return `${base} ${timePart}`
    }
    return base
  }

  function selectType(type) {
    setCurrentType(type)
    setCategory(categories[type][0].value)
  }

  function getCategoryIcon(type, cat) {
    const found = categories[type].find(c => c.value === cat)
    return found ? found.icon : '📦'
  }

  function addRecord() {
    const trimmedNote = note.trim()
    const parsedAmount = parseFloat(amount)
    const finalDate = recordDate || getTodayStr()

    if (!parsedAmount || parsedAmount <= 0) {
      alert('请输入有效金额')
      return
    }

    const timeStr = new Date().toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const newRecord = {
      id: Date.now(),
      type: currentType,
      category,
      note: trimmedNote,
      amount: parsedAmount,
      date: finalDate,
      time: timeStr
    }

    setRecords(prev => [newRecord, ...prev])
    setNote('')
    setAmount('')
    setRecordDate(getTodayStr())
    setCurrentMonth(new Date(finalDate + 'T00:00:00'))
  }

  function deleteRecord(id) {
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  function clearAll() {
    if (records.length === 0) return
    if (confirm('确定要清空所有记录吗？此操作不可恢复。')) {
      setRecords([])
    }
  }

  function formatMoney(num) {
    return '¥' + num.toFixed(2)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addRecord()
  }

  // 计算当月统计数据
  const monthRecords = records.filter(r => isInCurrentMonth(r.date))
  const totalIncome = monthRecords
    .filter(r => r.type === 'income')
    .reduce((s, r) => s + r.amount, 0)
  const totalExpense = monthRecords
    .filter(r => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0)
  const balance = totalIncome - totalExpense

  const sortedRecords = [...monthRecords].sort((a, b) => {
    if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '')
    return b.id - a.id
  })

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          color: #333;
        }
        .back-link-wrap {
          max-width: 480px;
          margin: 0 auto 12px;
        }
        .back-link {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(255,255,255,0.2);
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          transition: background 0.2s;
        }
        .back-link:hover { background: rgba(255,255,255,0.35); }
        .container {
          max-width: 480px;
          margin: 0 auto;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          padding: 24px 20px;
          text-align: center;
        }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header p { font-size: 12px; opacity: 0.85; }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #f0f0f0;
        }
        .stat-item {
          background: #fff;
          padding: 14px 8px;
          text-align: center;
        }
        .stat-label { font-size: 12px; color: #999; margin-bottom: 4px; }
        .stat-value { font-size: 18px; font-weight: 600; }
        .stat-income .stat-value { color: #4caf50; }
        .stat-expense .stat-value { color: #f44336; }
        .stat-balance .stat-value { color: #2196f3; }
        .form {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
        }
        .form-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .type-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .type-btn {
          flex: 1;
          padding: 8px;
          border: 2px solid #eee;
          background: #fff;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        .type-btn.active.expense {
          border-color: #f44336;
          background: #ffebee;
          color: #f44336;
        }
        .type-btn.active.income {
          border-color: #4caf50;
          background: #e8f5e9;
          color: #4caf50;
        }
        select, input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        select:focus, input:focus { border-color: #667eea; }
        .amount-input { position: relative; flex: 1; }
        .amount-input::before {
          content: "¥";
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          z-index: 1;
        }
        .amount-input input { padding-left: 28px; }
        .btn-add {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-add:hover { opacity: 0.9; }
        .records {
          padding: 16px 20px;
          max-height: 400px;
          overflow-y: auto;
        }
        .records-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .records-title { font-size: 15px; font-weight: 600; }
        .btn-clear {
          font-size: 12px;
          color: #f44336;
          background: none;
          border: none;
          cursor: pointer;
        }
        .record-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        .record-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .record-icon.expense { background: #ffebee; }
        .record-icon.income { background: #e8f5e9; }
        .record-info { flex: 1; min-width: 0; }
        .record-category { font-size: 14px; font-weight: 500; }
        .record-note { font-size: 12px; color: #999; margin-top: 2px; }
        .record-amount {
          font-size: 15px;
          font-weight: 600;
          margin-right: 8px;
        }
        .record-amount.expense { color: #f44336; }
        .record-amount.income { color: #4caf50; }
        .btn-delete {
          color: #ccc;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
        }
        .btn-delete:hover { color: #f44336; }
        .empty {
          text-align: center;
          padding: 40px 20px;
          color: #ccc;
          font-size: 14px;
        }
        .empty-icon { font-size: 40px; margin-bottom: 8px; }
        .month-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: #fafafa;
          border-bottom: 1px solid #eee;
        }
        .month-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 6px;
          color: #666;
          transition: background 0.2s;
        }
        .month-btn:hover { background: #f0f0f0; }
        .month-label {
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }
        .date-row {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }
        .date-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .date-input:focus { border-color: #667eea; }
        .record-date {
          font-size: 11px;
          color: #bbb;
          margin-top: 2px;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="back-link-wrap">
        <Link to="/" className="back-link">← 返回作品集</Link>
      </div>

      <div className="container">
        <div className="header">
          <h1>记账小工具</h1>
          <p>记录每一笔收支，轻松管理财务</p>
        </div>

        <div className="month-nav">
          <button className="month-btn" onClick={() => changeMonth(-1)}>◀</button>
          <span className="month-label">{getMonthStr(currentMonth)}</span>
          <button className="month-btn" onClick={() => changeMonth(1)}>▶</button>
        </div>

        <div className="stats">
          <div className="stat-item stat-income">
            <div className="stat-label">收入</div>
            <div className="stat-value">{formatMoney(totalIncome)}</div>
          </div>
          <div className="stat-item stat-expense">
            <div className="stat-label">支出</div>
            <div className="stat-value">{formatMoney(totalExpense)}</div>
          </div>
          <div className="stat-item stat-balance">
            <div className="stat-label">结余</div>
            <div className="stat-value">{formatMoney(balance)}</div>
          </div>
        </div>

        <div className="form">
          <div className="type-toggle">
            <button
              className={`type-btn ${currentType === 'expense' ? 'active' : ''} expense`}
              onClick={() => selectType('expense')}
            >
              支出
            </button>
            <button
              className={`type-btn ${currentType === 'income' ? 'active' : ''} income`}
              onClick={() => selectType('income')}
            >
              收入
            </button>
          </div>
          <div className="date-row">
            <input
              type="date"
              className="date-input"
              value={recordDate}
              onChange={e => setRecordDate(e.target.value)}
            />
          </div>
          <div className="form-row">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories[currentType].map(c => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.value}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="备注（可选）"
              maxLength="20"
              value={note}
              onChange={e => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="amount-input">
              <input
                type="number"
                placeholder="金额"
                step="0.01"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <button className="btn-add" onClick={addRecord}>添加记录</button>
        </div>

        <div className="records">
          <div className="records-header">
            <span className="records-title">交易记录</span>
            <button className="btn-clear" onClick={clearAll}>清空全部</button>
          </div>
          {monthRecords.length === 0 ? (
            <div className="empty fade-in">
              <div className="empty-icon">📝</div>
              本月暂无记录，开始记一笔吧
            </div>
          ) : (
            sortedRecords.map((r, i) => (
              <div
                key={r.id}
                className="record-item fade-in"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className={`record-icon ${r.type}`}>
                  {getCategoryIcon(r.type, r.category)}
                </div>
                <div className="record-info">
                  <div className="record-category">{r.category}</div>
                  <div className="record-note">
                    {r.note || formatDateDisplay(r.date, r.time)}
                  </div>
                  {r.note && (
                    <div className="record-date">
                      {formatDateDisplay(r.date, r.time)}
                    </div>
                  )}
                </div>
                <div className={`record-amount ${r.type}`}>
                  {r.type === 'income' ? '+' : '-'}{formatMoney(r.amount)}
                </div>
                <button
                  className="btn-delete"
                  onClick={() => deleteRecord(r.id)}
                  title="删除"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
