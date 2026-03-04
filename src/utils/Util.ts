// Define a function to convert a File object to a Base64 string
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // reader.result will be the Data URL (e.g., data:image/png;base64,...)
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('FileReader could not convert file to string'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

export function unicodeToBase64(str: string): string {
  // Encode the string into a UTF-8 byte array
  const utf8Bytes: Uint8Array = new TextEncoder().encode(str);
  
  // Convert the byte array to a binary string where each character is a byte
  const binaryString: string = String.fromCharCode(...utf8Bytes);
  
  // Encode the binary string using btoa()
  return btoa(binaryString);
}