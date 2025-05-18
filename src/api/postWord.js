export const postWord = async (word) => {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    if (res.ok) {
        const data = await res.json();
        return data;
    }

}