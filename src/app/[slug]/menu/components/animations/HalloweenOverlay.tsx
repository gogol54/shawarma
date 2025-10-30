'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useRef,useState } from "react"

const ghosts = ["/halloween/ghost.png", "/halloween/ghost02.png"]
const pumpkins = ["/halloween/pumpkin.png", "/halloween/witches.png"]
const bats = ["/halloween/bat.png", "/halloween/black-evil-cat.png"]

export default function HalloweenOverlay() {
  const [elements, setElements] = useState<
    { id: number; src: string; x: number; y: number; size: number }[]
  >([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // gera os elementos aleatórios
    const newElements = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      src: [ghosts, pumpkins, bats][Math.floor(Math.random() * 3)][
        Math.floor(Math.random() * 2)
      ],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 30,
    }))
    setElements(newElements)

    // tenta tocar o áudio
    const audio = audioRef.current
    if (audio) {
      audio.volume = 0.4
      audio.loop = true

      const playAudio = () => {
        audio.play().catch(() => {
          // browsers bloqueiam autoplay, ativa ao primeiro clique
          const resume = () => {
            audio.play()
            document.removeEventListener("click", resume)
          }
          document.addEventListener("click", resume)
        })
      }

      playAudio()
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
      {/* Áudio de fundo */}
      <audio
        ref={audioRef}
        src="/halloween/sounds/castle-theme.mp3"
        preload="auto"
      />

      {/* Itens animados */}
      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{ opacity: 0, y: -50 }}
          animate={{
            opacity: [0.2, 0.8, 0.4],
            y: ["0%", "100%"],
            x: [`${el.x}%`, `${el.x + Math.random() * 10 - 5}%`],
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute"
          style={{
            top: `${el.y}%`,
            left: `${el.x}%`,
          }}
        >
          <Image
            src={el.src}
            alt="Halloween item"
            width={el.size}
            height={el.size}
            className="opacity-80 select-none"
            draggable={false}
          />
        </motion.div>
      ))}
    </div>
  )
}
