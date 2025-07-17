package net.fionix.elelem

import android.os.Bundle
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge layout
        window.decorView.let { decorView ->
            ViewCompat.setOnApplyWindowInsetsListener(decorView) { view, insets ->
                val sysInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars())
                val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
                view.setPadding(
                    sysInsets.left, 
                    sysInsets.top, 
                    sysInsets.right, 
                    maxOf(sysInsets.bottom, imeInsets.bottom)
                )
                insets
            }
        }
    }
}