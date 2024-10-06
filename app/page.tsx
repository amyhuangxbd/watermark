'use client'
import Image from "next/image";
import { useContext, createContext, useState } from "react"
import FileUpload from "./components/fileUpload";
import TabWrapper from "./components/tabwrapper";
import { FileContext } from "./components/fileContext";

export default function Home() {
  const [file, setFile] = useState(null)
  return (
    <FileContext.Provider value={{file, setFile}}>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <FileUpload />
        <TabWrapper />
      </main>
    </FileContext.Provider>
  );
}
