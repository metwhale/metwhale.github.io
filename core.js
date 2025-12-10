/**
 * 微信防红跳转系统
 * 部署到 GitHub Pages 后使用
 * 访问格式: https://your-domain/?u=BASE64编码的目标URL
 */

const Config = {
  // 参数名，可自定义混淆
  paramKey: 'u',
  // 是否在微信内显示提示（而非直接跳转）
  showTipInWechat: true,
  // 跳转延迟(ms)
  redirectDelay: 100
};

const Utils = {
  // 获取URL参数
  getParam(key) {
    return new URLSearchParams(location.search).get(key);
  },
  
  // Base64解码（支持中文）
  decode(str) {
    try {
      return decodeURIComponent(atob(str).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
    } catch {
      return null;
    }
  },
  
  // Base64编码（支持中文）
  encode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode('0x' + p1)
    ));
  },
  
  // 检测是否微信环境
  isWechat() {
    return /MicroMessenger/i.test(navigator.userAgent);
  },
  
  // 检测是否移动端
  isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
};

const App = {
  init() {
    const encoded = Utils.getParam(Config.paramKey);
    
    if (!encoded) {
      this.showError('缺少跳转参数');
      return;
    }
    
    const targetUrl = Utils.decode(encoded);
    
    if (!targetUrl || !this.isValidUrl(targetUrl)) {
      this.showError('无效的链接');
      return;
    }
    
    // 微信内打开 - 使用 iframe 嵌入
    if (Utils.isWechat()) {
      this.loadIframe(targetUrl);
      return;
    }
    
    // 非微信环境 - 直接跳转
    this.redirect(targetUrl);
  },
  
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  redirect(url) {
    setTimeout(() => {
      location.replace(url);
    }, Config.redirectDelay);
  },
  
  loadIframe(url) {
    // 隐藏加载动画
    const app = document.getElementById('app');
    app.style.display = 'none';
    
    // 创建全屏 iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.id = 'contentFrame';
    iframe.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      margin: 0;
      padding: 0;
      overflow: hidden;
      z-index: 9999;
    `;
    
    // 加载失败处理
    iframe.onerror = () => {
      this.showError('页面加载失败');
    };
    
    document.body.appendChild(iframe);
    
    // 设置页面样式，防止滚动条
    document.body.style.cssText = 'margin:0;padding:0;overflow:hidden;';
    document.documentElement.style.cssText = 'margin:0;padding:0;overflow:hidden;';
  },
  
  showError(msg) {
    const app = document.getElementById('app');
    app.style.display = 'flex';
    app.innerHTML = `<div class="error"><h3>⚠️ ${msg}</h3><p>请检查链接是否正确</p></div>`;
  }
};

// 启动
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
