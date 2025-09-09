"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/features/userSlice";

const ProfilePage = () => {
  const user = useSelector(selectUser);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form
        // onSubmit={handleSubmit}
        className="max-w-2xl mx-auto space-y-4 p-10 mt-10 mb-10 border rounded bg-white shadow"
      >
        <h2 className="text-xl font-bold">Personal information</h2>

        <input
          name="email"
          disabled
          className="w-full border px-3 py-2 rounded bg-red"
          placeholder={user.email}
        />
        <input
          type="text"
          name="full_name"
          value={user.full_name}
          // onChange={handleChange}
          className="w-full border p-2 rounded"
        />
       
          <Link className="bg-blue-600 p-2 rounded text-white " href={"/changePass"}>changePass</Link>

        {/* {message && <p className="text-sm mt-2">{message}</p>} */}
      </form>
    </div>
  );
};

export default ProfilePage;
