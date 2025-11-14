#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor

def create_presentation():
    # إنشاء عرض تقديمي جديد
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    # الشريحة 1: العنوان الرئيسي
    slide1 = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
    
    # خلفية متدرجة (محاكاة)
    background = slide1.shapes.add_shape(
        1,  # Rectangle
        0, 0, prs.slide_width, prs.slide_height
    )
    background.fill.solid()
    background.fill.fore_color.rgb = RGBColor(79, 70, 229)  # لون أزرق بنفسجي
    background.line.fill.background()
    
    # العنوان الرئيسي
    title_box = slide1.shapes.add_textbox(
        Inches(1), Inches(2.5), Inches(8), Inches(1.5)
    )
    title_frame = title_box.text_frame
    title_frame.text = "كيفية الربح بالذكاء الاصطناعي"
    title_para = title_frame.paragraphs[0]
    title_para.alignment = PP_ALIGN.CENTER
    title_para.font.size = Pt(54)
    title_para.font.bold = True
    title_para.font.color.rgb = RGBColor(255, 255, 255)
    
    # العنوان الفرعي
    subtitle_box = slide1.shapes.add_textbox(
        Inches(1), Inches(4.2), Inches(8), Inches(0.8)
    )
    subtitle_frame = subtitle_box.text_frame
    subtitle_frame.text = "اكتشف الفرص الذهبية في عصر الذكاء الاصطناعي"
    subtitle_para = subtitle_frame.paragraphs[0]
    subtitle_para.alignment = PP_ALIGN.CENTER
    subtitle_para.font.size = Pt(24)
    subtitle_para.font.color.rgb = RGBColor(255, 255, 255)
    
    # أيقونة
    icon_box = slide1.shapes.add_textbox(
        Inches(4.5), Inches(5.5), Inches(1), Inches(1)
    )
    icon_frame = icon_box.text_frame
    icon_frame.text = "🤖"
    icon_para = icon_frame.paragraphs[0]
    icon_para.alignment = PP_ALIGN.CENTER
    icon_para.font.size = Pt(72)
    
    # الشريحة 2: إنشاء المحتوى
    slide2 = prs.slides.add_slide(prs.slide_layouts[6])
    
    # خلفية
    bg2 = slide2.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg2.fill.solid()
    bg2.fill.fore_color.rgb = RGBColor(249, 250, 251)
    bg2.line.fill.background()
    
    # العنوان
    title2_box = slide2.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9), Inches(0.8))
    title2_frame = title2_box.text_frame
    title2_frame.text = "1. إنشاء المحتوى بالذكاء الاصطناعي"
    title2_para = title2_frame.paragraphs[0]
    title2_para.alignment = PP_ALIGN.CENTER
    title2_para.font.size = Pt(36)
    title2_para.font.bold = True
    title2_para.font.color.rgb = RGBColor(31, 41, 55)
    
    # البطاقات
    cards = [
        {"icon": "✍️", "title": "كتابة المقالات", "desc": "استخدم أدوات مثل ChatGPT لكتابة مقالات احترافية وبيعها للمواقع والشركات"},
        {"icon": "🎨", "title": "تصميم الصور", "desc": "أنشئ صور فريدة باستخدام Midjourney أو DALL-E وبعها على منصات التصميم"},
        {"icon": "🎬", "title": "إنتاج الفيديوهات", "desc": "أنشئ محتوى فيديو باستخدام أدوات الذكاء الاصطناعي لليوتيوب ووسائل التواصل"},
        {"icon": "🎵", "title": "إنتاج الموسيقى", "desc": "أنشئ موسيقى خالية من حقوق الملكية وبعها على المنصات المختلفة"}
    ]
    
    positions = [(0.5, 1.8), (5.2, 1.8), (0.5, 4.5), (5.2, 4.5)]
    
    for i, (card, pos) in enumerate(zip(cards, positions)):
        # صندوق البطاقة
        card_box = slide2.shapes.add_shape(1, Inches(pos[0]), Inches(pos[1]), Inches(4.3), Inches(2.2))
        card_box.fill.solid()
        card_box.fill.fore_color.rgb = RGBColor(255, 255, 255)
        card_box.line.color.rgb = RGBColor(229, 231, 235)
        card_box.line.width = Pt(1)
        
        # الأيقونة
        icon_box = slide2.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 0.2), Inches(0.8), Inches(0.6))
        icon_frame = icon_box.text_frame
        icon_frame.text = card["icon"]
        icon_para = icon_frame.paragraphs[0]
        icon_para.font.size = Pt(36)
        
        # العنوان
        title_box = slide2.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 0.9), Inches(4), Inches(0.4))
        title_frame = title_box.text_frame
        title_frame.text = card["title"]
        title_para = title_frame.paragraphs[0]
        title_para.font.size = Pt(18)
        title_para.font.bold = True
        title_para.font.color.rgb = RGBColor(31, 41, 55)
        
        # الوصف
        desc_box = slide2.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 1.4), Inches(3.9), Inches(0.7))
        desc_frame = desc_box.text_frame
        desc_frame.text = card["desc"]
        desc_frame.word_wrap = True
        desc_para = desc_frame.paragraphs[0]
        desc_para.font.size = Pt(12)
        desc_para.font.color.rgb = RGBColor(107, 114, 128)
    
    # الشريحة 3: الخدمات والاستشارات
    slide3 = prs.slides.add_slide(prs.slide_layouts[6])
    
    # خلفية
    bg3 = slide3.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg3.fill.solid()
    bg3.fill.fore_color.rgb = RGBColor(249, 250, 251)
    bg3.line.fill.background()
    
    # العنوان
    title3_box = slide3.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9), Inches(0.8))
    title3_frame = title3_box.text_frame
    title3_frame.text = "2. تقديم الخدمات والاستشارات"
    title3_para = title3_frame.paragraphs[0]
    title3_para.alignment = PP_ALIGN.CENTER
    title3_para.font.size = Pt(36)
    title3_para.font.bold = True
    title3_para.font.color.rgb = RGBColor(31, 41, 55)
    
    # الخدمات
    services = [
        {"num": "01", "title": "استشارات الذكاء الاصطناعي", "desc": "ساعد الشركات على دمج الذكاء الاصطناعي في أعمالها وحقق دخل مرتفع"},
        {"num": "02", "title": "تطوير Chatbots", "desc": "أنشئ روبوتات محادثة ذكية للشركات لتحسين خدمة العملاء"},
        {"num": "03", "title": "تدريب وورش عمل", "desc": "قدم دورات تدريبية حول استخدام أدوات الذكاء الاصطناعي"},
        {"num": "04", "title": "أتمتة العمليات", "desc": "ساعد الشركات على أتمتة مهامها باستخدام الذكاء الاصطناعي"}
    ]
    
    y_start = 1.8
    for i, service in enumerate(services):
        y_pos = y_start + (i * 1.3)
        
        # صندوق الخدمة
        service_box = slide3.shapes.add_shape(1, Inches(1), Inches(y_pos), Inches(8), Inches(1.1))
        service_box.fill.solid()
        service_box.fill.fore_color.rgb = RGBColor(255, 255, 255)
        service_box.line.color.rgb = RGBColor(229, 231, 235)
        service_box.line.width = Pt(1)
        
        # الرقم
        num_box = slide3.shapes.add_textbox(Inches(1.3), Inches(y_pos + 0.15), Inches(0.8), Inches(0.8))
        num_frame = num_box.text_frame
        num_frame.text = service["num"]
        num_para = num_frame.paragraphs[0]
        num_para.alignment = PP_ALIGN.CENTER
        num_para.font.size = Pt(32)
        num_para.font.bold = True
        num_para.font.color.rgb = RGBColor(79, 70, 229)
        
        # العنوان
        title_box = slide3.shapes.add_textbox(Inches(2.3), Inches(y_pos + 0.2), Inches(6), Inches(0.4))
        title_frame = title_box.text_frame
        title_frame.text = service["title"]
        title_para = title_frame.paragraphs[0]
        title_para.font.size = Pt(18)
        title_para.font.bold = True
        title_para.font.color.rgb = RGBColor(31, 41, 55)
        
        # الوصف
        desc_box = slide3.shapes.add_textbox(Inches(2.3), Inches(y_pos + 0.6), Inches(6), Inches(0.4))
        desc_frame = desc_box.text_frame
        desc_frame.text = service["desc"]
        desc_frame.word_wrap = True
        desc_para = desc_frame.paragraphs[0]
        desc_para.font.size = Pt(12)
        desc_para.font.color.rgb = RGBColor(107, 114, 128)
    
    # الشريحة 4: المنتجات الرقمية
    slide4 = prs.slides.add_slide(prs.slide_layouts[6])
    
    # خلفية
    bg4 = slide4.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg4.fill.solid()
    bg4.fill.fore_color.rgb = RGBColor(249, 250, 251)
    bg4.line.fill.background()
    
    # العنوان
    title4_box = slide4.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9), Inches(0.8))
    title4_frame = title4_box.text_frame
    title4_frame.text = "3. إنشاء وبيع المنتجات الرقمية"
    title4_para = title4_frame.paragraphs[0]
    title4_para.alignment = PP_ALIGN.CENTER
    title4_para.font.size = Pt(36)
    title4_para.font.bold = True
    title4_para.font.color.rgb = RGBColor(31, 41, 55)
    
    # المنتجات
    products = [
        {
            "icon": "📱",
            "title": "تطبيقات الذكاء الاصطناعي",
            "items": ["تطبيقات تحرير الصور", "مساعدين شخصيين ذكيين", "أدوات الإنتاجية"]
        },
        {
            "icon": "🔌",
            "title": "إضافات وأدوات",
            "items": ["إضافات المتصفح", "قوالب جاهزة", "أدوات SaaS"]
        },
        {
            "icon": "📚",
            "title": "كورسات ومحتوى تعليمي",
            "items": ["دورات فيديو", "كتب إلكترونية", "قوالب Prompts"]
        }
    ]
    
    x_positions = [1, 3.8, 6.6]
    
    for i, (product, x_pos) in enumerate(zip(products, x_positions)):
        # صندوق المنتج
        product_box = slide4.shapes.add_shape(1, Inches(x_pos), Inches(2), Inches(2.6), Inches(4))
        product_box.fill.solid()
        product_box.fill.fore_color.rgb = RGBColor(255, 255, 255)
        product_box.line.color.rgb = RGBColor(229, 231, 235)
        product_box.line.width = Pt(1)
        
        # الأيقونة
        icon_box = slide4.shapes.add_textbox(Inches(x_pos + 0.8), Inches(2.3), Inches(1), Inches(0.8))
        icon_frame = icon_box.text_frame
        icon_frame.text = product["icon"]
        icon_para = icon_frame.paragraphs[0]
        icon_para.alignment = PP_ALIGN.CENTER
        icon_para.font.size = Pt(48)
        
        # العنوان
        title_box = slide4.shapes.add_textbox(Inches(x_pos + 0.2), Inches(3.3), Inches(2.2), Inches(0.6))
        title_frame = title_box.text_frame
        title_frame.text = product["title"]
        title_frame.word_wrap = True
        title_para = title_frame.paragraphs[0]
        title_para.alignment = PP_ALIGN.CENTER
        title_para.font.size = Pt(14)
        title_para.font.bold = True
        title_para.font.color.rgb = RGBColor(31, 41, 55)
        
        # القائمة
        items_text = "\n".join([f"• {item}" for item in product["items"]])
        items_box = slide4.shapes.add_textbox(Inches(x_pos + 0.2), Inches(4.2), Inches(2.2), Inches(1.5))
        items_frame = items_box.text_frame
        items_frame.text = items_text
        items_frame.word_wrap = True
        for para in items_frame.paragraphs:
            para.font.size = Pt(11)
            para.font.color.rgb = RGBColor(107, 114, 128)
            para.space_after = Pt(6)
    
    # الشريحة 5: BLACKBOXAI - أداة قوية للربح
    slide5 = prs.slides.add_slide(prs.slide_layouts[6])
    
    # خلفية متدرجة
    bg5 = slide5.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg5.fill.solid()
    bg5.fill.fore_color.rgb = RGBColor(17, 24, 39)  # خلفية داكنة
    bg5.line.fill.background()
    
    # العنوان الرئيسي
    title5_box = slide5.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9), Inches(0.8))
    title5_frame = title5_box.text_frame
    title5_frame.text = "BLACKBOXAI - أداتك السرية للربح 🚀"
    title5_para = title5_frame.paragraphs[0]
    title5_para.alignment = PP_ALIGN.CENTER
    title5_para.font.size = Pt(40)
    title5_para.font.bold = True
    title5_para.font.color.rgb = RGBColor(255, 255, 255)
    
    # الوصف
    desc_box = slide5.shapes.add_textbox(Inches(1), Inches(1.5), Inches(8), Inches(0.6))
    desc_frame = desc_box.text_frame
    desc_frame.text = "منصة ذكاء اصطناعي متقدمة تساعدك على البرمجة والإبداع وتحقيق الدخل"
    desc_para = desc_frame.paragraphs[0]
    desc_para.alignment = PP_ALIGN.CENTER
    desc_para.font.size = Pt(18)
    desc_para.font.color.rgb = RGBColor(156, 163, 175)
    
    # المميزات
    features = [
        {"icon": "💻", "title": "كتابة الأكواد", "desc": "يساعدك في كتابة أكواد برمجية احترافية بجميع اللغات"},
        {"icon": "🔍", "title": "البحث الذكي", "desc": "يبحث في الإنترنت ويجلب لك أحدث المعلومات"},
        {"icon": "📝", "title": "إنشاء المحتوى", "desc": "يكتب مقالات ومحتوى تسويقي عالي الجودة"},
        {"icon": "🎨", "title": "توليد الصور", "desc": "ينشئ صور فريدة باستخدام الذكاء الاصطناعي"},
        {"icon": "⚡", "title": "سرعة فائقة", "desc": "استجابة فورية وأداء ممتاز"},
        {"icon": "🆓", "title": "مجاني للبدء", "desc": "ابدأ مجاناً واستكشف الإمكانيات"}
    ]
    
    positions = [(0.8, 2.5), (3.8, 2.5), (6.8, 2.5), (0.8, 4.5), (3.8, 4.5), (6.8, 4.5)]
    
    for feature, pos in zip(features, positions):
        # صندوق الميزة
        feature_box = slide5.shapes.add_shape(1, Inches(pos[0]), Inches(pos[1]), Inches(2.7), Inches(1.7))
        feature_box.fill.solid()
        feature_box.fill.fore_color.rgb = RGBColor(31, 41, 55)
        feature_box.line.color.rgb = RGBColor(79, 70, 229)
        feature_box.line.width = Pt(2)
        
        # الأيقونة
        icon_box = slide5.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 0.15), Inches(0.6), Inches(0.5))
        icon_frame = icon_box.text_frame
        icon_frame.text = feature["icon"]
        icon_para = icon_frame.paragraphs[0]
        icon_para.font.size = Pt(32)
        
        # العنوان
        title_box = slide5.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 0.7), Inches(2.3), Inches(0.4))
        title_frame = title_box.text_frame
        title_frame.text = feature["title"]
        title_para = title_frame.paragraphs[0]
        title_para.font.size = Pt(14)
        title_para.font.bold = True
        title_para.font.color.rgb = RGBColor(255, 255, 255)
        
        # الوصف
        desc_box = slide5.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 1.1), Inches(2.3), Inches(0.5))
        desc_frame = desc_box.text_frame
        desc_frame.text = feature["desc"]
        desc_frame.word_wrap = True
        desc_para = desc_frame.paragraphs[0]
        desc_para.font.size = Pt(10)
        desc_para.font.color.rgb = RGBColor(156, 163, 175)
    
    # الشريحة 6: نصائح للنجاح
    slide6 = prs.slides.add_slide(prs.slide_layouts[6])
    
    # خلفية
    bg6 = slide6.shapes.add_shape(1, 0, 0, prs.slide_width, prs.slide_height)
    bg6.fill.solid()
    bg6.fill.fore_color.rgb = RGBColor(249, 250, 251)
    bg6.line.fill.background()
    
    # العنوان
    title6_box = slide6.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.7))
    title6_frame = title6_box.text_frame
    title6_frame.text = "نصائح للنجاح في الربح من الذكاء الاصطناعي"
    title6_para = title6_frame.paragraphs[0]
    title6_para.alignment = PP_ALIGN.CENTER
    title6_para.font.size = Pt(32)
    title6_para.font.bold = True
    title6_para.font.color.rgb = RGBColor(31, 41, 55)
    
    # النصائح
    tips = [
        {"icon": "🎯", "title": "ابدأ الآن", "desc": "لا تنتظر، المجال ينمو بسرعة والفرص متاحة للجميع"},
        {"icon": "📖", "title": "تعلم باستمرار", "desc": "تابع آخر التطورات والأدوات الجديدة في مجال الذكاء الاصطناعي"},
        {"icon": "💡", "title": "كن مبدعاً", "desc": "ابحث عن طرق فريدة لاستخدام الذكاء الاصطناعي في حل المشاكل"},
        {"icon": "🤝", "title": "بناء شبكة علاقات", "desc": "تواصل مع المهتمين بالمجال وشارك خبراتك"},
        {"icon": "⚡", "title": "الجودة أولاً", "desc": "ركز على تقديم قيمة حقيقية لعملائك"},
        {"icon": "📈", "title": "قيّم وطوّر", "desc": "راقب نتائجك وحسّن استراتيجياتك باستمرار"}
    ]
    
    positions = [(0.8, 1.5), (3.8, 1.5), (6.8, 1.5), (0.8, 3.8), (3.8, 3.8), (6.8, 3.8)]
    
    for tip, pos in zip(tips, positions):
        # صندوق النصيحة
        tip_box = slide6.shapes.add_shape(1, Inches(pos[0]), Inches(pos[1]), Inches(2.7), Inches(2))
        tip_box.fill.solid()
        tip_box.fill.fore_color.rgb = RGBColor(255, 255, 255)
        tip_box.line.color.rgb = RGBColor(229, 231, 235)
        tip_box.line.width = Pt(1)
        
        # الأيقونة
        icon_box = slide6.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 0.2), Inches(0.6), Inches(0.5))
        icon_frame = icon_box.text_frame
        icon_frame.text = tip["icon"]
        icon_para = icon_frame.paragraphs[0]
        icon_para.font.size = Pt(28)
        
        # العنوان
        title_box = slide6.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 0.8), Inches(2.3), Inches(0.4))
        title_frame = title_box.text_frame
        title_frame.text = tip["title"]
        title_para = title_frame.paragraphs[0]
        title_para.font.size = Pt(14)
        title_para.font.bold = True
        title_para.font.color.rgb = RGBColor(31, 41, 55)
        
        # الوصف
        desc_box = slide6.shapes.add_textbox(Inches(pos[0] + 0.2), Inches(pos[1] + 1.2), Inches(2.3), Inches(0.7))
        desc_frame = desc_box.text_frame
        desc_frame.text = tip["desc"]
        desc_frame.word_wrap = True
        desc_para = desc_frame.paragraphs[0]
        desc_para.font.size = Pt(10)
        desc_para.font.color.rgb = RGBColor(107, 114, 128)
    
    # الرسالة النهائية
    final_box = slide6.shapes.add_textbox(Inches(1.5), Inches(6.2), Inches(7), Inches(0.8))
    final_frame = final_box.text_frame
    final_frame.text = "🚀 ابدأ رحلتك نحو الربح من الذكاء الاصطناعي اليوم!"
    final_para = final_frame.paragraphs[0]
    final_para.alignment = PP_ALIGN.CENTER
    final_para.font.size = Pt(20)
    final_para.font.bold = True
    final_para.font.color.rgb = RGBColor(79, 70, 229)
    
    # حفظ الملف
    prs.save('عرض_الربح_بالذكاء_الاصطناعي.pptx')
    print("✅ تم إنشاء ملف PowerPoint بنجاح!")
    print("📁 اسم الملف: عرض_الربح_بالذكاء_الاصطناعي.pptx")

if __name__ == "__main__":
    create_presentation()
