# Cloudinary Removal - Remaining Controllers Update Guide

## Controllers Already Updated ✅

- ✅ pet.js - Complete
- ✅ business.js - Complete
- ✅ lost.js - Complete
- ✅ ads.js - Complete

## Controllers Remaining to Update

### 1. product.js

**Cloudinary Usage Lines**: 170, 543

**Changes Needed**:

```javascript
// At top of file, replace:
const cloudinary = require("cloudinary").v2;
// With:
const { saveFile, deleteFile } = require("../utils/fileUpload.helper");

// Line ~170 (createProduct function):
// Replace:
const result = await cloudinary.uploader.upload(file.tempFilePath, {...});
// With:
const uploadResult = await saveFile(file, "products");
if (!uploadResult.success) {
  return res.status(500).json({ success: false, message: "Error uploading image" });
}
// Then use: uploadResult.url instead of result.secure_url

// Line ~543 (updateProduct function):
// Same pattern as above
```

### 2. promotion.js

**Cloudinary Usage Lines**: 132, 330

**Changes Needed**:

```javascript
// At top, add:
const { saveFile } = require("../utils/fileUpload.helper");

// Line ~132 (createPromotion):
const uploadResult = await saveFile(file, "promotions");
// Use: uploadResult.url

// Line ~330 (updatePromotion):
const uploadResult = await saveFile(file, "promotions");
// Use: uploadResult.url
```

### 3. qrcode.js

**Cloudinary Usage Line**: 294

**Changes Needed**:

```javascript
// At top:
const { saveFile } = require("../utils/fileUpload.helper");

// Line ~294:
const uploadResult = await saveFile(file, "qrcodes");
// Use: uploadResult.url
```

### 4. tags.js

**Cloudinary Usage Lines**: 72, 259, 277, 345

**Changes Needed**:

```javascript
// At top:
const { saveFile, deleteFile } = require("../utils/fileUpload.helper");

// Line ~72 (createTag):
const uploadResult = await saveFile(file, "tags");
// Use: uploadResult.url

// Line ~259 (deleteTag - remove cloudinary delete):
// Remove: await cloudinary.uploader.destroy(icon.public_id);
// Add: await deleteFile(icon.url.split("/uploads/")[1]);

// Line ~277 (updateTag):
const uploadResult = await saveFile(file, "tags");
// Use: uploadResult.url

// Line ~345 (deleteTag - same as 259):
// Remove cloudinary delete, add local delete
```

### 5. medicalhistory.js

**Cloudinary Usage Lines**: 112, 263, 1153, 1252, 1449

**Changes Needed**:

```javascript
// At top:
const { saveFile } = require("../utils/fileUpload.helper");

// All upload instances (~112, ~263, ~1153, ~1252, ~1449):
const uploadResult = await saveFile(file, "medical");
// Use: uploadResult.url instead of result.secure_url
```

## Pattern to Follow

For ALL controllers, the pattern is:

1. **Remove Cloudinary import and config**:

```javascript
// REMOVE:
const cloudinary = require("cloudinary").v2;
cloudinary.config({...});

// ADD:
const { saveFile, deleteFile } = require("../utils/fileUpload.helper");
```

2. **Replace upload calls**:

```javascript
// BEFORE:
const result = await cloudinary.uploader.upload(file.tempFilePath, {
  public_id: file.name,
  resource_type: "image",
  folder: "mascotas/xxx",
});
const imageUrl = result.secure_url;

// AFTER:
const uploadResult = await saveFile(file, "folder_name");
if (!uploadResult.success) {
  return res.status(500).json({
    success: false,
    message: "Error uploading image",
  });
}
const imageUrl = uploadResult.url;
```

3. **Replace delete calls** (if any):

```javascript
// BEFORE:
await cloudinary.uploader.destroy(publicId);

// AFTER:
const relativePath = imageUrl.split("/uploads/")[1];
await deleteFile(relativePath);
```

## Folder Names for Each Controller

- `pet.js` → "pets"
- `business.js` → "business"
- `lost.js` → "lost"
- `ads.js` → "ads"
- `product.js` → "products"
- `promotion.js` → "promotions"
- `qrcode.js` → "qrcodes"
- `tags.js` → "tags"
- `medicalhistory.js` → "medical"

## Testing After Updates

1. Test each upload endpoint
2. Verify images are saved in `/var/www/mascotas-backend/uploads/{folder}/`
3. Verify image URLs work: `https://api.yourdomain.com/uploads/{folder}/{filename}`
4. Test image deletion (if applicable)
5. Check file permissions: `ls -la /var/www/mascotas-backend/uploads/`
