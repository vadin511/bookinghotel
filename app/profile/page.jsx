"use client"

import { useUser } from "../User/page";

const page = () => {
  const { user } = useUser();
  return (
    <div>
      <h1>{user.full_name}</h1>
    </div>
  );
};

export default page;
