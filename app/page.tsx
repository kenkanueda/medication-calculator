"use client"

export default function TestPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'sans-serif' 
    }}>
      <h1>✅ デプロイ成功</h1>
      <p>この画面が表示されていれば、Vercelとの連携は正常です。</p>
      <button 
        onClick={() => alert('動作確認OK')}
        style={{ padding: '10px 20px', cursor: 'pointer' }}
      >
        クリックして動作テスト
      </button>
    </div>
  )
}

// "use client"

// import Component from "../medication-calculator"

// export default function SyntheticV0PageForDeployment() {
//   return <Component />
// }
