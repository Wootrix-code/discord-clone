import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001')

interface Message {
  username: string
  text: string
  channel: string
}

const CHANNELS = ['général', 'blabla', 'gaming', 'aide']

export default function App() {
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [input, setInput] = useState('')
  const [username, setUsername] = useState('')
  const [joined, setJoined] = useState(false)
  const [currentChannel, setCurrentChannel] = useState('général')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    socket.on('message', (msg: Message) => {
      setMessages(prev => ({
        ...prev,
        [msg.channel]: [...(prev[msg.channel] || []), msg]
      }))
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentChannel])

  const join = () => {
    if (username.trim()) {
      socket.emit('join-channel', 'général')
      setJoined(true)
    }
  }

  const switchChannel = (channel: string) => {
    setCurrentChannel(channel)
    socket.emit('join-channel', channel)
  }

  const send = () => {
    if (input.trim()) {
      socket.emit('message', { channel: currentChannel, username, text: input })
      setInput('')
    }
  }

  if (!joined) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#36393f',
    }}>
      <div style={{
        background: '#2f3136', padding: 32, borderRadius: 8,
        display: 'flex', flexDirection: 'column', gap: 16, width: 300,
      }}>
        <h2 style={{ color: 'white', margin: 0, textAlign: 'center' }}>Bienvenue !</h2>
        <p style={{ color: '#b9bbbe', margin: 0, textAlign: 'center', fontSize: 14 }}>
          Choisis un pseudo pour rejoindre
        </p>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && join()}
          placeholder="Ton pseudo..."
          style={{
            padding: '10px 12px', borderRadius: 4, border: 'none',
            background: '#202225', color: 'white', fontSize: 16, outline: 'none',
          }}
        />
        <button onClick={join} style={{
          padding: '10px', borderRadius: 4, border: 'none',
          background: '#5865f2', color: 'white', fontSize: 16,
          cursor: 'pointer', fontWeight: 'bold',
        }}>
          Rejoindre
        </button>
      </div>
    </div>
  )

  const channelMessages = messages[currentChannel] || []

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#36393f' }}>

      {/* Barre latérale */}
      <div style={{ width: 240, background: '#2f3136', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '16px', borderBottom: '1px solid #202225',
          color: 'white', fontWeight: 'bold', fontSize: 16,
        }}>
          Mon serveur
        </div>

        {/* Salons */}
        <div style={{ padding: '8px' }}>
          <p style={{ color: '#8e9297', fontSize: 11, fontWeight: 'bold', padding: '8px 8px 4px', margin: 0, textTransform: 'uppercase' }}>
            Salons textuels
          </p>
          {CHANNELS.map(channel => (
            <div
              key={channel}
              onClick={() => switchChannel(channel)}
              style={{
                padding: '6px 8px', borderRadius: 4, cursor: 'pointer',
                color: currentChannel === channel ? 'white' : '#8e9297',
                background: currentChannel === channel ? '#393c43' : 'transparent',
                fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 2,
              }}
            >
              <span style={{ color: '#8e9297' }}>#</span> {channel}
            </div>
          ))}
        </div>

        {/* Profil */}
        <div style={{
          marginTop: 'auto', padding: '8px 12px', background: '#292b2f',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#5865f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: 14,
          }}>
            {username[0].toUpperCase()}
          </div>
          <span style={{ color: 'white', fontSize: 14 }}>{username}</span>
        </div>
      </div>

      {/* Zone de chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid #202225',
          color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#8e9297' }}>#</span> {currentChannel}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {channelMessages.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#5865f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', flexShrink: 0,
              }}>
                {m.username[0].toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: 14, textAlign: 'left' }}>
                  {m.username}
                </span>
                <p style={{ color: '#dcddde', margin: '2px 0 0', fontSize: 15, textAlign: 'left' }}>
                  {m.text}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '0 16px 24px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={`Envoyer un message dans #${currentChannel}`}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 8,
              border: 'none', background: '#40444b', color: 'white',
              fontSize: 15, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  )
}