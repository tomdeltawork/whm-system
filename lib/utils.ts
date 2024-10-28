// export function cn(...classes: string[]) {
//     return classes.filter(Boolean).join(" ");
// }
export function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter((c): c is string => typeof c === "string").join(" ")
}