require 'mulberry/assets/base'

module Mulberry
  module Asset
    class Image < Mulberry::Asset::Base
      protected
      def asset_type_dir
        'images'
      end

      def asset_type
        'image'
      end

      public
      def reference
        ref = { :image => { '_reference' => id } }

        if !@caption.nil?
          ref[:caption] = { '_reference' => @caption.id }
        end

        ref
      end

      def item
        item_data = {
          :type       =>  self.asset_type,
          :id         =>  id,
          :streamed   =>  false,
          :name       =>  @asset_name
        }

        [ :featured, :featured_small, :gallery, :original ].each do |image_type|
          override = "#{@asset_name}-#{image_type}.#{@filename.split('.').last}"
          item_data[image_type] = {
            :filename => File.exists?(File.join(@dir, override)) ? override : @filename
          }
        end

        item_data
      end
    end
  end
end