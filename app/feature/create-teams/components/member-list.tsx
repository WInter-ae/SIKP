import React from "react";

interface Member {
  id: number;
  name: string;
  role: string;
  isLeader?: boolean;
}

interface MemberListProps {
  title: string;
  members: Member[];
  showActions?: boolean;
}

const MemberList: React.FC<MemberListProps> = ({
  title,
  members,
  showActions = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-gray-100 px-6 py-3 font-semibold text-gray-800 border-b">
        {title}
      </div>
      <div className="p-6">
        {members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fa fa-users text-4xl mb-3 text-gray-300"></i>
            <p>Tidak ada anggota</p>
          </div>
        ) : (
          <ul>
            {members.map((member) => (
              <li
                key={member.id}
                className="flex justify-between items-center py-3 border-b last:border-b-0"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold mr-4">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-600">{member.role}</div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex space-x-2">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition">
                      Terima
                    </button>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition">
                      Tolak
                    </button>
                  </div>
                )}

                {!showActions && !member.isLeader && (
                  <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
                    Keluarkan
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MemberList;
