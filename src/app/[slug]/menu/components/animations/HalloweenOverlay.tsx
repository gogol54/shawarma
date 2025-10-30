'use client'

import { motion } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"

const ghosts = ["/halloween/ghost.png", "/halloween/ghost02.png"]
const pumpkins = ["/halloween/pumpkin.png", "/halloween/witches.png"]
const bats = ["/halloween/bat.png", "/halloween/black-evil-cat.png"]

export default function HalloweenOverlay() {
  const [elements, setElements] = useState<
    { id: number; src: string; x: number; y: number; size: number }[]
  >([])

  useEffect(() => {
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
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
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
            className="opacity-80"
          />
        </motion.div>
      ))}
    </div>
  )
}
