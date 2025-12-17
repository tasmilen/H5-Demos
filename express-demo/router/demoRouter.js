const express = require('express');

const router = express.Router();

router.get('/test', (req, res) => {
  res.send('This is a test route from demo router.');
}); 

router.post('/covers', (req, res) => {
  console.log('covers body', req.body);
  res.json({
    ressultCode: `2001`,
    message: 'success',
    resultBody: [
      {
        id: 1,
        name: '政府项目投标封面',
        fileName: 'cover_government.pdf',
        createTime: '2025-10-15T10:30:00',
        previewUrl: '',
      },
      {
        id: 2,
        name: '商业项目封面',
        fileName: 'cover_business.docx',
        createTime: '2025-10-20T14:45:00',
        previewUrl: '',
        isDefault: true,
      },
      {
        id: 3,
        name: '政府项目投标封面',
        fileName: 'cover_government.pdf',
        createTime: '2025-10-15T10:30:00',
        previewUrl: '',
      },
      {
        id: 4,
        name: '商业项目封面',
        fileName: 'cover_business.docx',
        createTime: '2025-10-20T14:45:00',
        previewUrl: '',
      },
      {
        id: 5,
        name: '政府项目投标封面',
        fileName: 'cover_government.pdf',
        createTime: '2025-10-15T10:30:00',
        previewUrl: '',
      },
      {
        id: 6,
        name: '商业项目封面',
        fileName: 'cover_business.docx',
        createTime: '2025-10-20T14:45:00',
        previewUrl: '',
      },
    ],
  });
});

router.post('/templates', (req, res) => {
  console.log('templates body', req.body);
  res.json({
    ressultCode: `2001`,
    message: 'success',
    resultBody: [
      {
        id: 1,
        name: '政府采购投标模板',
        fileName: 'template_government.docx',
        createTime: '2025-09-10T09:15:00',
        previewUrl: '',
        isDefault: true,
      },
      {
        id: 2,
        name: '工程建设项目模板',
        fileName: 'template_construction.pdf',
        createTime: '2025-09-18T16:20:00',
        previewUrl: '',
        isDefault: false,
      },
      {
        id: 3,
        name: 'IT服务投标模板',
        fileName: 'template_it_service.docx',
        createTime: '2025-10-05T14:30:00',
        previewUrl: '',
        isDefault: false,
      },
      {
        id: 4,
        name: '咨询服务项目模板',
        fileName: 'template_consulting.pdf',
        createTime: '2025-10-12T11:45:00',
        previewUrl: '',
        isDefault: false,
      },
      {
        id: 5,
        name: '设备采购投标模板',
        fileName: 'template_equipment.docx',
        createTime: '2025-10-18T09:20:00',
        previewUrl: '',
        isDefault: false,
      },
      {
        id: 6,
        name: '研发项目投标模板',
        fileName: 'template_research.docx',
        createTime: '2025-10-22T13:15:00',
        previewUrl: '',
        isDefault: false,
      },
    ],
  });
});


module.exports = router;
