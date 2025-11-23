import Announcements from "@/components/Announcements";
import TimetableBoard from "@/components/TimetableBoard";
import { getCurrentUser } from "@/lib/server/utils";
import { createUrqlServerClient } from "@/lib/urql/clients/server.client";
import { gql } from "@urql/core";
import EventList from "@/components/EventList";

const GET_STAFF = gql(`
  query GetStaffDetails($id: ID, $clerkUserId: String) {
    staff(id: $id, clerkUserId: $clerkUserId) {
      id
      class {
        id name
      }
    }
  }
`);

const TeacherPage = async () => {
  const { currentUserId } = await getCurrentUser();

  const { client } = await createUrqlServerClient();
  const { data } = await client.query(GET_STAFF, {
    clerkUserId: currentUserId,
  });

  const teacher = data?.staff;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full rounded-md bg-white p-4">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <TimetableBoard classId={teacher?.class.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full flex-col gap-8 xl:w-1/3">
        <EventList />
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
