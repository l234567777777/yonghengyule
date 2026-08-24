import re

p = r'D:\a777.cc.cd\index.html'
s = open(p, encoding='utf-8').read()
orig = s

# Fix 1: 修复损坏的 btnLoadResources 按钮（嵌套错误 + 乱码文字）
bad = re.search(r'<button class="btn btn-primary" <button id="btnLoadResources".*?</button>', s)
if bad:
    s = s[:bad.start()] + '<button id="btnLoadResources" class="btn btn-secondary" style="margin-right:8px;background:#238636" onclick="loadAllResourcesFromApi()">加载云端数据</button>' + s[bad.end():]
    print('[ok] 修复 btnLoadResources 按钮')
else:
    print('[warn] 未匹配到 btnLoadResources 损坏模式')

# Fix 2: 修复游离 '>' -> 还原 statsGrid 容器开始标签（否则 switchTab 抛错、标签切换崩溃）
s2 = s.replace(
    '    >\n        <div class="stat-label">资源总数</div>',
    '    <div class="stats-grid" id="statsGrid">\n        <div class="stat-label">资源总数</div>',
    1)
if s2 != s:
    s = s2
    print('[ok] 还原 statsGrid 容器')
else:
    print('[warn] 未匹配到 statsGrid 游离 >')

# Fix 3: 追加 UI 增强样式（不改动原有规则，靠后定义覆盖）
css = '''
    /* ====== UI 优化增强（追加） ====== */
    /* 资源表格：长列表内部滚动 + 吸顶表头，1100+ 行不再撑爆页面 */
    .table-container { max-height: 70vh; overflow: auto; }
    .table-container thead th { position: sticky; top: 0; background: #161b22; z-index: 5; }
    .table-container tbody td:nth-child(5) { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .table-container tbody td:nth-child(1) { max-width: 340px; }
    /* 统计卡片增强 */
    .stat-card { background: linear-gradient(135deg, #161b22, #1a2230); transition: transform 0.2s, border-color 0.2s; }
    .stat-card:hover { transform: translateY(-2px); border-color: #3b82f6; }
    /* 标签导航增强 */
    .tab-nav { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 1px solid #30363d; }
    .tab-nav button { background: transparent; border: none; color: #8b949e; padding: 12px 20px; font-size: 15px; font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
    .tab-nav button:hover { color: #c9d1d9; }
    .tab-nav button.active { color: #f0f6fc; border-bottom-color: #3b82f6; }
    /* 空状态增强 */
    .empty-state { padding: 60px 20px; text-align: center; color: #6e7681; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    /* 窄屏适配 */
    @media (max-width: 768px) {
      .header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .header-actions { width: 100%; }
      .admin-page { padding: 12px; }
      .table-container { max-height: 60vh; }
    }
'''
s = s.replace('</style>', css + '</style>', 1)

if s != orig:
    open(p, 'w', encoding='utf-8').write(s)
    print('[ok] 已写入', p)
else:
    print('[warn] 未发生任何改动')
