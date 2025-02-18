const video = document.getElementById('camera');
const objectInfo = document.getElementById('objectInfo');
let canvas = document.createElement('canvas');
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
const HUGGING_FACE_API_TOKEN = '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'; // توکن خودت رو وارد کن

// دسترسی به دوربین
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("خطا در دسترسی به دوربین:", err);
        objectInfo.innerText = "دسترسی به دوربین وجود ندارد.";
    });

// تشخیص اشیاء
document.getElementById('identifyButton').addEventListener('click', () => {
    objectInfo.innerText = "در حال پردازش...";

    // گرفتن عکس از ویدیو
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(uploadToHuggingFace, 'image/jpeg');
});

function uploadToHuggingFace(blob) {
    const reader = new FileReader();
    reader.onloadend = function() {
        const base64data = reader.result.split(',')[1];

        // ارسال به Hugging Face
        fetch(HUGGING_FACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: base64data })
        })
        .then(res => res.json())
        .then(result => {
            console.log('نتیجه Hugging Face:', result);

            // بررسی نتیجه و نمایش
            if (result && result.length > 0) {
                const labels = result.map(item => item.label).join(', ');
                objectInfo.innerText = `اشیاء شناسایی شده: ${labels}`;
            } else {
                objectInfo.innerText = "چیزی شناسایی نشد.";
            }
        })
        .catch(err => {
            console.error('خطا در Hugging Face:', err);
            objectInfo.innerText = "خطا در تشخیص!";
        });
    };
    reader.readAsDataURL(blob);
}

// صفحه بعد
document.getElementById('nextPageButton').addEventListener('click', () => {
    alert("این ویژگی هنوز پیاده‌سازی نشده است!");
});
