"use client";

import { useAnnouncementSubscription } from "@/lib/generated/graphql/client";
import { useEffect } from "react";

const NotificationSubscriber = () => {
  const [res] = useAnnouncementSubscription();

  useEffect(() => {
    if (res.data) {
      new Notification(res.data.announcementCreated.title, {
        body: res.data.announcementCreated.content,
      });
    }
  }, [res.data]);

  console.log({ response: res });

  return <div>NotificationSubscriber</div>;
};
export default NotificationSubscriber;
