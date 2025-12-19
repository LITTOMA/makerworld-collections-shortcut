# Icon Generator for MakerWorld QuickFav
# 为 MakerWorld QuickFav 生成简单的占位图标

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "MakerWorld Collection Shortcut Icon Generator" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 检查 System.Drawing 程序集
try {
    Add-Type -AssemblyName System.Drawing
    Write-Host "[OK] System.Drawing loaded" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to load System.Drawing" -ForegroundColor Red
    Write-Host "Please ensure .NET Framework is installed" -ForegroundColor Yellow
    exit 1
}

# 创建图标函数
function Create-Icon {
    param(
        [int]$size,
        [string]$filename,
        [string]$text = "★"
    )
    
    Write-Host "Creating ${filename} (${size}x${size})..." -NoNewline
    
    try {
        # 创建位图
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($bmp)
        
        # 设置抗锯齿
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
        
        # 填充背景（MakerWorld 橙色）
        $bgColor = [System.Drawing.Color]::FromArgb(255, 107, 53)
        $brush = New-Object System.Drawing.SolidBrush($bgColor)
        $graphics.FillRectangle($brush, 0, 0, $size, $size)
        
        # 添加文字（白色星标）
        $textColor = [System.Drawing.Color]::White
        $textBrush = New-Object System.Drawing.SolidBrush($textColor)
        $fontSize = [int]($size * 0.6)
        $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        
        # 居中文字
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        
        $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
        $graphics.DrawString($text, $font, $textBrush, $rect, $format)
        
        # 保存
        $bmp.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # 清理
        $graphics.Dispose()
        $bmp.Dispose()
        $brush.Dispose()
        $textBrush.Dispose()
        $font.Dispose()
        $format.Dispose()
        
        Write-Host " [OK]" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        return $false
    }
}

# 创建目录
$chromeIconsDir = "chrome-extension\icons"
$firefoxIconsDir = "firefox-extension\icons"

if (-not (Test-Path $chromeIconsDir)) {
    New-Item -ItemType Directory -Path $chromeIconsDir -Force | Out-Null
}

if (-not (Test-Path $firefoxIconsDir)) {
    New-Item -ItemType Directory -Path $firefoxIconsDir -Force | Out-Null
}

Write-Host ""
Write-Host "Generating icons..." -ForegroundColor Yellow
Write-Host ""

# 创建临时图标
$success = $true
$success = $success -and (Create-Icon -size 16 -filename "icon16.png" -text "★")
$success = $success -and (Create-Icon -size 48 -filename "icon48.png" -text "★")
$success = $success -and (Create-Icon -size 128 -filename "icon128.png" -text "★")

if ($success) {
    Write-Host ""
    Write-Host "Copying icons to extension directories..." -ForegroundColor Yellow
    
    # 复制到 Chrome 扩展目录
    Copy-Item "icon16.png" "$chromeIconsDir\icon16.png" -Force
    Copy-Item "icon48.png" "$chromeIconsDir\icon48.png" -Force
    Copy-Item "icon128.png" "$chromeIconsDir\icon128.png" -Force
    Write-Host "[OK] Copied to $chromeIconsDir" -ForegroundColor Green
    
    # 复制到 Firefox 扩展目录
    Copy-Item "icon16.png" "$firefoxIconsDir\icon16.png" -Force
    Copy-Item "icon48.png" "$firefoxIconsDir\icon48.png" -Force
    Copy-Item "icon128.png" "$firefoxIconsDir\icon128.png" -Force
    Write-Host "[OK] Copied to $firefoxIconsDir" -ForegroundColor Green
    
    # 删除临时文件
    Remove-Item "icon16.png", "icon48.png", "icon128.png" -Force
    
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "Icons generated successfully!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review the generated icons in the icons folders" -ForegroundColor White
    Write-Host "2. (Optional) Replace with custom icons" -ForegroundColor White
    Write-Host "3. Load the extension in your browser" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "Icon generation failed!" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host "You can also create icons manually using online tools" -ForegroundColor Yellow
    Write-Host "See tools/create-icons.md for more information" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

