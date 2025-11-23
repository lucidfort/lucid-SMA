import dynamic from "next/dynamic";

const AttendanceChart = dynamic(() => import("./AttendanceChart"), {
  loading: () => <h1>Loading...</h1>,
});

const AttendanceChartContainer = async ({ data }: { data: { present: boolean; date: Date }[] }) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const attendanceMap: { [key: string]: { present: number; absent: number } } =
  {
    Mon: { present: 0, absent: 0 },
    Tue: { present: 0, absent: 0 },
    Wed: { present: 0, absent: 0 },
    Thu: { present: 0, absent: 0 },
    Fri: { present: 0, absent: 0 },
  };

  data.forEach((item) => {
    const itemDate = new Date(item.date);
    const itemDay = itemDate.getDay();
    const dayIndex = itemDay === 0 ? 6 : itemDay - 1;
    const dayName = daysOfWeek[dayIndex];

    if (dayName in attendanceMap) {
      if (item.present) {
        attendanceMap[dayName].present++;
      } else {
        attendanceMap[dayName].absent++;
      }
    }
  });

  const formattedData = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));

  return (
    <AttendanceChart data={formattedData} />
  );
};

export default AttendanceChartContainer;
