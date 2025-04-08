import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="text-center justify-center relative top-2/4 text-blue-400 underline">
      <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/rosul`}>
        Clique para se redirecionar ao nosso site
      </Link>
    </div>
  )
};

export default page;
