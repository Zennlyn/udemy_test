const date = new Date();

export default function getDate() {
  let options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleString("en-US", options);
}
